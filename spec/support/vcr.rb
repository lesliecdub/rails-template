# frozen_string_literal: true
VCR.configure do |config|
  config.cassette_library_dir = "spec/support/http_cache/vcr"
  config.hook_into :webmock

  # Only want VCR to intercept requests to external URLs.
  config.ignore_localhost = true
  config.ignore_hosts 'codeclimate.com'
end
