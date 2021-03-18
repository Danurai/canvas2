(ns canvas2.web
   (:require 
    [compojure.core :refer [context defroutes GET ANY POST]]
    [compojure.route :refer [resources]]
    [hiccup.page :as h]))
    
(def header
  [:head
    [:meta {:charset "utf-8"}]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
    [:link {
      :href "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" 
      :rel "stylesheet" 
      :integrity "sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" 
      :crossorigin "anonymous"}]])
      
(def bootstrap 
  [:script {
    :src "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" 
    :integrity "sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0" 
    :crossorigin "anonymous"}])

(defn- navlink [ req, uri, title ]
  [:li.nav-item [:a.nav-link {:href uri :class (if (= (:uri req) uri) "active")} title]])
    
(defn navbar [ req ]
  [:nav#nav.navbar.navbar-dark.bg-dark.navbar-expand-lg
    [:div.container-fluid
      [:button.navbar-toggler {:type "button" :data-bs-toggle "collapse" :data-bs-target "#navbarNav"}
        [:span.navbar-toggler-icon]]
      [:div#navbarNav.collapse.navbar-collapse
        [:ul.navbar-nav
          (navlink req "/" "Home")
          (navlink req "/webgl" "WebGL Demo")
          (navlink req "/three" "Three Demo")
          (navlink req "/threehexes" "Three Hexes")
          (navlink req "/threevox" "Three Vox")
          (navlink req "/threecljs" "Three CLJS")
        ]]]])
        
(defn home [ req ]
  (h/html5
    header
    [:body
      (navbar req)
      [:div#app]
      bootstrap
      (h/include-js "js/compiled/canvasapp.js")]))
    
(defn webgl [ req ]
  (h/html5
    header
    [:body
      (navbar req)
      [:div.container.my-2
        [:canvas#glcanvas {:width "640" :height "480"}]]]
    bootstrap
    [:script {
      :src "https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js" 
      :integrity "sha512-zhHQR0/H5SEBL3Wn6yYSaTTZej12z0hVZKOv3TwCUXT1z5qeqGcXJLLrbERYRScEDDpYIJhPC1fk31gqR783iQ==" 
      :crossorigin "anonymous"}]
    (h/include-js "js/webgl.js")))
    
(defn threedemo [ req ]
  (h/html5
    header
    [:body {:style "margin: 0;"}
      (navbar req)
      [:canvas#c]]
    bootstrap
    ;[:script {:type "module" :src "js/threedemo.js"}]
    (h/include-css "css/threedemo.css")
    ;(h/include-js "js/three.js")
    ;(h/include-js "js/GLTFLoader.js")
    [:script {:type "module" :src "js/threedemo.js"}]))
    
(defn threehexes [ req ]
  (h/html5
    header
    [:body {:style "margin: 0;"}
      (navbar req)
      [:canvas#chex]]
    bootstrap
    (h/include-css "css/threedemo.css")
    [:script {:type "module" :src "js/threehexes.js"}]))

(defn threevox [ req ]
  (h/html5
    header
    [:body {:style "margin: 0;"}
      (navbar req)
      [:canvas#chex]
      [:div "Models by maxparata" [:a {:href "https://maxparata.itch.io/tank-tactic"} "https://maxparata.itch.io/tank-tactic"]]
    bootstrap
    (h/include-css "css/threedemo.css")
    [:script {:type "module" :src "js/threevox.js"}]))
    
(defn threecljs [ req ]
  (h/html5
    header
    [:body {:style "margin: 0;"}
      (navbar req)
      [:canvas#c]]
    bootstrap
    (h/include-css "css/threedemo.css")
    (h/include-js "js/three.js")
    ;(h/include-js "js/GLTFLoader.js")
    (h/include-js "js/compiled/app.js")
    ;[:script {:type "module" :src "js/compiled/app.js"}]
    ))
    
(defroutes app-routes
  (GET "/"           [] home)
  (GET "/webgl"      [] webgl)
  (GET "/three"      [] threedemo)
  (GET "/threehexes" [] threehexes)
  (GET "/threevox"   [] threevox)
  (GET "/threecljs"  [] threecljs)
  (resources "/"))

(def app
  (-> app-routes))