Rails.application.routes.draw do
  get 'start', to: 'start#index'
  post 'fetch', to: 'start#fetch'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
