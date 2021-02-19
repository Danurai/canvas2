(ns canvas2.corecanvas
  (:require 
    [reagent.core :as r]))
  
(def app (r/atom {
  :dots [{:id 1 :clr "red" :pos 1}{:id 2 :clr "green" :pos 2}{:id 3 :clr "blue" :pos 3}]
  :move nil
  }))

(defn createhitmapcontext []
  (let [hitmap (.createElement js/document "canvas")]
    (set! (.-width hitmap) 1000)
    (set! (.-height hitmap) 200)
    (.getContext hitmap "2d")))
    
(defn draw_page [ canvas ]
  (let [ctx (.getContext canvas "2d")
        w   (.-clientWidth canvas)
        h   (.-clientHeight canvas)
        img (.querySelector js/document "#img")
        hitctx (createhitmapcontext)
        ]
        
    (.clearRect ctx 0 0 w h)
    
    (set! (.-fillStyle ctx) "#000000")
    (.fillRect ctx 0 0 w h)
    
    (set! (.-lineWidth ctx) 2)
    (doseq [n (:dots @app) :let [xpos (-> n :pos (* 100))]]
      (set! (.-strokeStyle ctx) (:clr n))
      (.beginPath ctx)
      (.arc ctx xpos 100 45 0 (* 2 Math/PI))
      (.stroke ctx)
      
      (set! (.-fillStyle hitctx) (str "rgb(0,0," (:id n) ")"))
      (.beginPath hitctx)
      (.arc hitctx xpos 100 45 0 (* 2 Math/PI))
      (.fill hitctx)
    )
    
    (when-let [move (:move @app)]
      (.beginPath ctx)
      (set! (.-fillStyle ctx) "rgba(255,255,255,0.5)")
      (if-let [snapid (:snap move)]
        (.arc ctx (* snapid 100) 100 45 0 (* 2 Math/PI))
        (.arc ctx (-> @app :move :draw :x) (-> @app :move :draw :y) 45 0 (* 2 Math/PI)))
      (.fill ctx))
        
    
    (swap! app assoc :hitctx hitctx)
    
    ;(let [{:keys [x y]} @app]
    ;  (.drawImage ctx img x y))
    (.putImageData (.getContext (.querySelector js/document "#test") "2d") (.getImageData hitctx 0 0 1000 200) 1000 200)
    ;(.putImageData ctx (.getImageData hitctx 0 0 1000 200) 1000 200)
  ))
      
(defn mouse-move [ evt ]
  (let [ele  (.-target evt)
        x    (- (.-pageX evt) (.-offsetLeft ele))
        y    (- (.-pageY evt) (.-offsetTop ele))
        tgt  (-> @app :hitctx (.getImageData x y 1 1) .-data (clojure.string/split #",") (get 2) int)]
    (if (:move @app)
      (swap! app assoc :move 
        (assoc (:move @app)
          :current {:x x :y y}
          :draw {:x (+ x (-> @app :move :diff :x))
                 :y (+ y (-> @app :move :diff :y))}
          :snap (if (= 0 tgt) nil tgt))))))

(defn mouse-down [ evt ]
  (let [ele  (.-target evt)
        x    (- (.-pageX evt) (.-offsetLeft ele))
        y    (- (.-pageY evt) (.-offsetTop ele))
        src  (-> @app :hitctx (.getImageData x y 1 1) .-data (clojure.string/split #",") (get 2) int)]
    (if (> src 0)
      (swap! app assoc :move 
        (hash-map 
          :current {:x x 
                    :y y}
          :diff    {:x (-> src (* 100) (- x)) 
                    :y (- 100 y)}
          :draw    {:x (-> src (* 100))
                    :y 100}
          :srcid src)))))
    
(defn mouse-up [ evt ]
  (swap! app dissoc :move))
    
  
(defn canvas []
  (let [dom-node (r/atom nil)]
    (r/create-class {
      :component-did-update 
        (fn [ this ] (draw_page (.getElementById js/document "canvas")))
      :component-did-mount
        (fn [ this ] (draw_page (.getElementById js/document "canvas")))
        ;(fn [ this ] (reset! dom-node (r/dom-node this)))
      :reagent-render
        (fn [ ]
          @app
          @dom-node
          [:canvas#canvas.border {
            :width "1000px" :height "200px"
            :on-mouse-move mouse-move
            :on-mouse-down mouse-down
            :on-mouse-up   mouse-up
            :on-mouse-out  mouse-up
            }])})))
  
  
  
(defn main []
  [:div.container.my-3 {:style {:select "none"}}
    ;[:div [:img#img {:src "img/cubetexture.png" :hidden true}]]
    [:div (-> @app  str)]
    [:div [canvas]]
    [:div [:canvas#test {:width "1000px" :height "200px"}]]
    ])
  
(r/render [main] (.getElementById js/document "app"))