class StartController < ApplicationController
  include Prices

  before_action :request_prices
  before_action :prices_params, only: :fetch

  def index
    @labels = Request.labels
    @prices.to_json
  end

  def fetch
    response = {has_changed: false}
    unless compare.empty?
      response[:template] = []
      compare.each do |log|
        response[:template] << load_partial(log[:id], log[:new_price])
      end
      response[:log] = compare
      response[:has_changed] = true
      response[:date] = @request.date
    end
    render json: response
  end

  private

  def request_prices
    @request = Request.new
    @prices = @request.prices
  end

  def compare
    # return fuels that have changed + changed value
    logs = []
    params[:prices].each do |k, v|
      change = @request.send(k) == v ? false : true
      if change 
        log = { 
          id: k,
          new_price: @request.send(k)
        }
        logs << log
      end
    end
    logs
  end

  def load_partial(id, price)
    render_to_string("_price_display_new_price", formats: [:html], layout: false, locals: {id: id, price: price})
  end

  def prices_params
    params.permit!
  end
end
