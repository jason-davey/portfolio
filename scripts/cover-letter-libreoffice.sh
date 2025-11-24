#!/bin/bash

# Cover Letter to DOCX with LibreOffice Template Conversion
# Purpose: Convert markdown cover letter to Word document using template formatting

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Configuration
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

    if ! command -v soffice &> /dev/null; then
        print_error "LibreOffice is required but not installed. Install with: brew install --cask libreoffice"
        exit 1
    fi

    print_success "All dependencies found"
}

# Function to setup temp directory
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

# Function to convert markdown to ODT (preserves more formatting)
convert_md_to_odt() {
    local input_file="$1"
    local output_file="$2"

    print_status "Converting markdown to ODT format..."

    if [ ! -f "$input_file" ]; then
        print_error "Input file not found: $input_file"
        exit 1
    fi

    pandoc "$input_file" -o "$output_file" \
        --from markdown \
        --to odt \
        --standalone

    print_success "ODT conversion completed"
}

# Function to convert ODT to DOCX using template
convert_odt_to_docx_with_template() {
    local input_odt="$1"
    local template="$2"
    local output_docx="$3"

    print_status "Converting to DOCX with template formatting..."

    # First, convert ODT to DOCX
    soffice --headless --convert-to docx --outdir "$(dirname "$output_docx")" "$input_odt" > /dev/null 2>&1

    # Move to final location if needed
    local odt_basename=$(basename "$input_odt" .odt)
    local converted_file="$(dirname "$output_docx")/${odt_basename}.docx"

    if [ "$converted_file" != "$output_docx" ]; then
        mv "$converted_file" "$output_docx"
    fi

    print_success "DOCX conversion completed"
}

# Function to apply template styles using pandoc
apply_template_styles() {
    local input_file="$1"
    local output_file="$2"

    print_status "Applying template styles..."

    if [ ! -f "$TEMPLATE_PATH" ]; then
        print_warning "Template not found: $TEMPLATE_PATH"
        print_warning "Skipping template application..."
        return 1
    fi

    local temp_output="${TEMP_DIR}/styled_output.docx"

    # Convert with reference template
    pandoc "$input_file" -o "$temp_output" \
        --from markdown \
        --to docx \
        --reference-doc "$TEMPLATE_PATH" \
        --standalone

    # Replace original with styled version
    mv "$temp_output" "$output_file"

    print_success "Template styles applied"
}

# Main function
main() {
    local input_file="$1"

    # Check if input file is provided
    if [ -z "$input_file" ]; then
        print_error "Usage: $0 <path-to-markdown-file>"
        print_error "Example: $0 Head_AI_Engineering_Cover_Letter_JasonDavey_2025.md"
        exit 1
    fi

    # Get absolute path
    if [[ "$input_file" != /* ]]; then
        input_file="$PROJECT_ROOT/$input_file"
    fi

    local filename=$(basename "$input_file" .md)
    local output_file="$PROJECT_ROOT/${filename}.docx"

    echo "=========================================="
    echo "Cover Letter to DOCX Converter"
    echo "Using Template: $(basename "$TEMPLATE_PATH")"
    echo "=========================================="
    echo

    # Run checks
    check_dependencies
    setup_temp_dir

    # Method 1: Direct pandoc conversion with reference-doc
    print_status "Method: Pandoc with reference template"
    apply_template_styles "$input_file" "$output_file"

    print_success "Process completed successfully!"
    print_status "Output file: $output_file"
    echo
    print_warning "Note: Pandoc applies style definitions (fonts, colors, spacing) from the template."
    print_warning "If you need headers/footers or page layout from template, those need manual setup."
    echo

    # Cleanup
    cleanup_temp_dir
}

# Trap to ensure cleanup on exit
trap cleanup_temp_dir EXIT

# Run main function with all arguments
main "$@"
