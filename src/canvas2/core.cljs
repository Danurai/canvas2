(ns canvas2.core
  )


(defn main [& args]
  (let [canvas (.querySelector js/document "#c")
        renderer (js/THREE.WebGLRenderer. (clj->js {:canvas canvas}))
        ;width (.-clientWidth canvas)
        ;height (.-clientHeight canvas)
        width (.-innerWidth js/window)
        height (.-innerHeight js/window)
        scene    (js/THREE.Scene.)
        camera   (js/THREE.PerspectiveCamera. 75 (/ width height) 0.1 100) 
        geometry (js/THREE.BoxGeometry.)
        material (js/THREE.MeshPhongMaterial. (clj->js {:color 0x55ddee}))
        cube     (js/THREE.Mesh. geometry material)
        light    (js/THREE.DirectionalLight. 0xFFFFFF 1)
        animate  (fn cb [] 
                  (js/requestAnimationFrame cb)
                  (set! (.. cube -rotation -x) (+ 0.01 (.. cube -rotation -x)))
                  (set! (.. cube -rotation -y) (+ 0.02 (.. cube -rotation -y)))
                  (.render renderer scene camera))
      ]
  (.setSize renderer width height)
  (.add scene cube)
  (.add scene light)
  (set! (.. camera -position -z) 5)
  (.set (.. light -position) -2 4 4)
  (animate)
))

(main)