#!/bin/bash

# Resume to Google Drive DOCX Conversion Script
# Based on Insyteful LMS kiro-to-drive-docx-only.sh workflow
# Purpose: Convert markdown resume to branded Word document and upload to Google Drive

set -e  # Exit on any error

# Configuration
GDRIVE_REMOTE="gdrive"
GDRIVE_FOLDER="Portfolio-Documents/Resumes"
TEMPLATE_PATH="Resume Doc template.dotx"
TEMP_DIR="./temp"

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

    print_status "Converting markdown to DOCX..."

    # Check if input file exists
    if [ ! -f "$input_file" ]; then
        print_error "Input file not found: $input_file"
        exit 1
    fi

    # Check if template exists and is valid
    if [ ! -f "$TEMPLATE_PATH" ]; then
        print_warning "Template not found: $TEMPLATE_PATH"
        print_status "Converting without template..."
        pandoc "$input_file" -o "$output_file" \
            --from markdown \
            --to docx \
            --standalone
    else
        print_status "Template found: $TEMPLATE_PATH"
        print_status "Attempting conversion with template..."

        # Try with template first, fallback to no template if it fails
        if ! pandoc "$input_file" -o "$output_file" \
            --from markdown \
            --to docx \
            --reference-doc "$TEMPLATE_PATH" \
            --standalone 2>/dev/null; then

            print_warning "Template conversion failed, trying without template..."
            pandoc "$input_file" -o "$output_file" \
                --from markdown \
                --to docx \
                --standalone
        else
            print_success "Template conversion successful"
        fi
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

    # Check if input file is provided
    if [ -z "$input_file" ]; then
        print_error "Usage: $0 <path-to-markdown-file>"
        print_error "Example: $0 ATS_Executive_Resume_JasonDavey_2025.md"
        exit 1
    fi

    # Get absolute path
    input_file=$(realpath "$input_file")
    local filename=$(basename "$input_file" .md)
    local output_file="$TEMP_DIR/${filename}.docx"

    echo "======================================"
    echo "Resume to Google Drive DOCX Converter"
    echo "======================================"
    echo

    # Run checks
    check_dependencies
    check_rclone_config

    # Setup
    setup_temp_dir

    # Convert
    convert_md_to_docx "$input_file" "$output_file"

    # Upload
    upload_to_gdrive "$output_file" "$GDRIVE_FOLDER"

    # Cleanup
    cleanup_temp_dir

    echo
    print_success "Process completed successfully!"
    print_status "Resume uploaded to: Google Drive > ${GDRIVE_FOLDER}/"
    echo
}

# Trap to cleanup on exit
trap cleanup_temp_dir EXIT

# Run main function with all arguments
main "$@"