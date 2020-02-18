if Rails.env.development?
    require "#{Rails.root}/lib/prices/request.rb"
end