module Prices
    class Request
        require 'nokogiri'
        require 'httparty'

        LABELS = {
            diesel_fuel: "Diesel",
            super_fuel: "Super",
            super_plus_fuel: "Super Plus",
            super_e10_fuel: "Super E10",
            date: 'Datum'
        }
        #Make this configureable
        SELECTORS = {
            diesel_fuel: "#sorte_3_1",
            super_fuel: "#sorte_5_3",
            super_plus_fuel: "#sorte_1_10",
            super_e10_fuel: "#sorte_16_9",
            date: '.aktualisierungsDatum strong'
        }
        # Make this ENV variable
        TARGET_URL = ENV['TARGET_URL']
        attr_reader :diesel_fuel, :super_fuel, :super_plus_fuel, :super_e10_fuel, :date
        attr_writer :diesel_fuel, :super_fuel, :super_plus_fuel, :super_e10_fuel, :date
        def initialize
            @prices = scrape(HTTParty.get(TARGET_URL))
            @diesel_fuel = @prices[:diesel_fuel]
            @super_fuel = @prices[:super_fuel]
            @super_plus_fuel = @prices[:super_plus_fuel]
            @super_e10_fuel = @prices[:super_e10_fuel]
            @date = get_date
        end

        def self.labels
            LABELS
        end
        
        def prices
            @prices
        end

        def get_date
            request = HTTParty.get(TARGET_URL)
            page = Nokogiri::HTML(request)
            date = page.css(SELECTORS[:date]).text()
        end

        def scrape(page)
            parsed_page = Nokogiri::HTML(page)
            prices = {}
            SELECTORS.each do |fuel, selector|
                next if fuel == :date
                prices[fuel] = parsed_page.css("#{selector}").text()
            end
            return prices
        end
    end
end