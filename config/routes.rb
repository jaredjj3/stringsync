Rails.application.routes.draw do
  mount_devise_token_auth_for "User", at: "auth"

  scope :api, defaults: { format: :json } do
    scope :v1 do
      resources :notations
      resources :users
      resources :tags
    end
  end

  # invokes fallback to hand off route handling to the client
  get "*path", to: "application#fallback_index_html", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
