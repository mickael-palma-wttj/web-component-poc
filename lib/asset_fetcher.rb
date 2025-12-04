# frozen_string_literal: true

##
# Fetches and filters assets from the data file
# Single Responsibility: Asset retrieval logic
#
class AssetFetcher
  class DataFileNotFound < StandardError; end
  class AssetNotFound < StandardError; end

  def initialize(data_path = AppConfig.data_file_path)
    @data_path = data_path
  end

  def all
    parse_assets
  end

  def by_types(types)
    parse_assets.select { |asset| types.include?(asset[:type]) }
  end

  def find_by_type(type)
    asset = parse_assets.find { |a| a[:type] == type }
    raise AssetNotFound, "Asset type '#{type}' not found" unless asset

    asset
  end

  def total_count
    parse_assets.length
  end

  private

  def parse_assets
    @parsed_assets ||= begin
      content = File.read(@data_path)
      AssetParser.new(content).call
    end
  rescue Errno::ENOENT
    raise DataFileNotFound, 'Data file not found'
  end
end
