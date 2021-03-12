(defproject canvas2 "0.1.0-SNAPSHOT"
  :description "canvas2"
  :url "https://github.com/Danurai/danurai.github.io"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}

  :min-lein-version "2.7.1"
  
  :main         canvas2.system

  :jar-name     "canvas2.jar"
  :uberjar-name "canvas2-standalone.jar"
  
  :repl-options {:init-ns user
                 :timeout 120000}
  
  :dependencies [[org.clojure/clojure "1.10.0"]
                [org.clojure/clojurescript "1.10.520"]
                [org.clojure/core.async  "0.3.443"]
                ; Web server
                [http-kit "2.3.0"]
                [com.stuartsierra/component "0.3.2"]
                ; routing
                [compojure "1.6.0"]
                ;[ring/ring-defaults "0.3.1"]
                ;[ring-cors "0.1.11"]
                [clj-http "3.7.0"]
                ; Websocket sente
                [com.taoensso/sente "1.12.0"]
                ; page rendering
                [hiccup "1.0.5"]
                [reagent "0.7.0"]
                [cljs-http "0.1.46"]
                [cljsjs/three "0.1.01-1"]
                ]

  :plugins [[lein-figwheel "0.5.14"]
            [lein-cljsbuild "1.1.7" :exclusions [[org.clojure/clojure]]]
            [lein-autoexpect "1.9.0"]]

  :source-paths ["src"]

  :cljsbuild {
    :builds {
      :dev {
        :source-paths ["src"]
        :figwheel true
        :compiler {
          :main canvas2.core
          :asset-path "/js/compiled/out"
          :output-to "resources/public/js/compiled/app.js"
          :output-dir "resources/public/js/compiled/out"
          :source-map-timestamp true
          :preloads [devtools.preload]
          }}
      :min {
        :source-paths ["src"]
        :compiler {
          :main canvas2.core
          :output-to "resources/public/js/compiled/app.js"
          :optimizations :advanced 
          :pretty-print false}}}}

  :figwheel { :css-dirs ["resources/public/css"]}

  ;; Setting up nREPL for Figwheel and ClojureScript dev
  ;; Please see:
  ;; https://github.com/bhauman/lein-figwheel/wiki/Using-the-Figwheel-REPL-within-NRepl
  :profiles {
    :uberjar {
      :aot :all
      :source-paths ["src"]
      :prep-tasks ["compile" ["cljsbuild" "once" "min"]]}
    :dev {
      :dependencies [[reloaded.repl "0.2.4"]
                     [expectations "2.2.0-rc3"]
                     [binaryage/devtools "0.9.4"]
                     [figwheel-sidecar "0.5.14"]
                     [cider/piggieback "0.4.0"]]
      ;; need to add dev source path here to get user.clj loaded
      :source-paths ["src" "dev"]
      ;; for CIDER
      ;; :plugins [[cider/cider-nrepl "0.12.0"]]
      :repl-options {
        :nrepl-middleware [cider.piggieback/wrap-cljs-repl]}
      ;; need to add the compliled assets to the :clean-targets
      :clean-targets 
        ^{:protect false} 
        ["resources/public/js/compiled" :target-path]}})
