#!/bin/bash

# Cover Letter to Google Drive DOCX Conversion Script
# Based on resume-to-drive-docx.sh workflow
# Purpose: Convert markdown cover letter to branded Word document and upload to Google Drive

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Configuration
GDRIVE_REMOTE="gdrive"
GDRIVE_FOLDER="Portfolio-Documents/Cover-Letters"
TEMPLATE_PATH="$PROJECT_ROOT/cover-letter-template.dotx"
TEMP_DIR="$PROJECT_ROOT/temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v pandoc &> /dev/null; then
        print_error "pandoc is required but not installed. Install with: brew install pandoc"
        exit 1
    fi

    if ! command -v rclone &> /dev/null; then
        print_error "rclone is required but not installed. Install with: brew install rclone"
        exit 1
    fi

    print_success "All dependencies found"
}

# Function to check rclone configuration
check_rclone_config() {
    print_status "Checking rclone configuration for Google Drive..."

    if ! rclone listremotes | grep -q "^${GDRIVE_REMOTE}:$"; then
        print_error "rclone remote '${GDRIVE_REMOTE}' not found."
        print_warning "Please run: rclone config"
        print_warning "And configure Google Drive with remote name: ${GDRIVE_REMOTE}"
        print_warning "Use account: jasdavey@gmail.com"
        exit 1
    fi

    print_success "rclone Google Drive remote found: ${GDRIVE_REMOTE}"
}

# Function to create temp directory
setup_temp_dir() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
    mkdir -p "$TEMP_DIR"
    print_status "Created temporary directory: $TEMP_DIR"
}

# Function to cleanup temp directory
cleanup_temp_dir() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        print_status "Cleaned up temporary directory"
    fi
}

# Function to convert markdown to docx using template
convert_md_to_docx() {
    local input_file="$1"
    local output_file="$2"

    print_status "Merging markdown content into template..."

    # Check if input file exists
    if [ ! -f "$input_file" ]; then
        print_error "Input file not found: $input_file"
        exit 1
    fi

    # Check if template exists
    if [ ! -f "$TEMPLATE_PATH" ]; then
        print_error "Template not found: $TEMPLATE_PATH"
        print_warning "Falling back to pandoc conversion..."
        pandoc "$input_file" -o "$output_file" \
            --from markdown \
            --to docx \
            --standalone
        return
    fi

    print_status "Template found: $TEMPLATE_PATH"
    print_status "Using Python merge script to preserve template structure..."

    # Use Python script to merge content into template
    source "$PROJECT_ROOT/.venv/bin/activate"
    python3 "$SCRIPT_DIR/merge_cover_letter.py" "$TEMPLATE_PATH" "$input_file" "$output_file"

    if [ $? -eq 0 ]; then
        print_success "Template merge successful"
    else
        print_error "Template merge failed"
        exit 1
    fi

    print_success "DOCX conversion completed: $output_file"
}

# Function to upload to Google Drive
upload_to_gdrive() {
    local local_file="$1"
    local gdrive_path="$2"

    print_status "Uploading to Google Drive: $gdrive_path"

    # Create the folder structure if it doesn't exist
    rclone mkdir "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"

    # Upload the file
    if rclone copy "$local_file" "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}/"; then
        print_success "Successfully uploaded to Google Drive"

        # Get the shareable link (optional)
        local filename=$(basename "$local_file")
        print_status "File location: Google Drive > ${GDRIVE_FOLDER}/${filename}"
    else
        print_error "Failed to upload to Google Drive"
        exit 1
    fi
}

# Main function
main() {
    local input_file="$1"
    local skip_upload="${2:-false}"

    # Check if input file is provided
    if [ -z "$input_file" ]; then
        print_error "Usage: $0 <path-to-markdown-file> [--local]"
        print_error "Example: $0 Deloitte_AI_UX_Cover_Letter_JasonDavey_2025.md"
        print_error "Example (local only): $0 Deloitte_AI_UX_Cover_Letter_JasonDavey_2025.md --local"
        exit 1
    fi

    # Check for --local flag
    if [[ "$skip_upload" == "--local" ]] || [[ "$2" == "--local" ]]; then
        skip_upload="true"
    fi

    # Get absolute path
    input_file=$(realpath "$input_file")
    local filename=$(basename "$input_file" .md)
    local output_file="$PROJECT_ROOT/${filename}.docx"

    echo "=========================================="
    echo "Cover Letter to DOCX Converter"
    echo "=========================================="
    echo

    # Run checks
    check_dependencies

    if [[ "$skip_upload" != "true" ]]; then
        check_rclone_config
    fi

    # Convert directly to project root (no temp dir needed for local)
    convert_md_to_docx "$input_file" "$output_file"

    # Upload only if not skipped
    if [[ "$skip_upload" != "true" ]]; then
        upload_to_gdrive "$output_file" "$GDRIVE_FOLDER"
        echo
        print_success "Process completed successfully!"
        print_status "Cover letter uploaded to: Google Drive > ${GDRIVE_FOLDER}/"
        print_status "Local copy saved: $output_file"
        echo
    else
        echo
        print_success "Process completed successfully!"
        print_status "Local cover letter saved: $output_file"
        echo
    fi
}

# Run main function with all arguments
main "$@"
