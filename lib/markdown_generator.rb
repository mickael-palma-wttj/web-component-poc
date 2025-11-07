##
# MarkdownGenerator
#
# Responsible for generating markdown content from structured asset objects.
# Formats assets into markdown with JSON blocks, following a consistent structure.
#
# Example:
#   assets = [{title: "Description", type: "text", data: {...}}, ...]
#   markdown = MarkdownGenerator.new(assets).call
#   File.write('data.md', markdown)
#
class MarkdownGenerator
  TITLE = '# qonto - Company Profile'.freeze
  SECTION_DIVIDER = '---'.freeze

  def initialize(assets)
    @assets = assets
  end

  ##
  # Generate markdown content from assets
  #
  # @return [String] Formatted markdown content
  #
  def call
    [header, asset_sections].join("\n\n")
  end

  private

  ##
  # Generate file header with title and timestamp
  #
  def header
    "#{TITLE}\nGenerated: #{formatted_date}"
  end

  ##
  # Format current date as DD/MM/YYYY
  #
  def formatted_date
    Time.now.strftime('%d/%m/%Y')
  end

  ##
  # Generate all asset sections joined by dividers
  #
  def asset_sections
    @assets
      .map { |asset| format_asset(asset) }
      .join("\n\n#{SECTION_DIVIDER}\n\n")
  end

  ##
  # Format single asset with title and JSON block
  #
  def format_asset(asset)
    "## #{asset['title']}\n\n#{format_json_block(asset)}"
  end

  ##
  # Format asset data as JSON code block
  #
  def format_json_block(asset)
    json_data = {
      type: asset['type'],
      data: asset['data']
    }
    "```json\n#{JSON.pretty_generate(json_data)}\n```"
  end
end
