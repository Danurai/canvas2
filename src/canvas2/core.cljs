(ns canvas2.core
  (:require cljsjs.three))

(def canvas   (.querySelector js/document "#c"))
(def renderer (js/THREE.WebGLRenderer. (clj->js { :canvas canvas :antialias true})))
(def scene    (js/THREE.Scene.))
(def camera   (let [fov 60 aspectratio (/ 16 9) near 1 far 1000]
  (js/THREE.PerspectiveCamera. fov aspectratio near far) ))
(def light (let [colour 0xFFFFFF intensity 1]
  (js/THREE.DirectionalLight. colour intensity)))


(defn on-window-resize [ evt ]
  (let [ width (.-innerWidth js/window) height (.-innerHeight js/window) ]
    (set! (.-aspect camera) (/ width height))
    (.updateProjectionMatrix camera)
    (.setSize renderer width height )
    ))

(def loader (js/THREE.CubeTextureLoader.))
(def skyboxtexture 
  (.load loader ["img/skybox/posx.png" "img/skybox/negx.png"
                 "img/skybox/posy.png" "img/skybox/negy.png"
                 "img/skybox/posz.png" "img/skybox/negz.png"]))

(defn main [& args]
  (let [width    (.-innerWidth js/window)
        height   (.-innerHeight js/window) 
        geometry (js/THREE.BoxGeometry.)
        material (js/THREE.MeshPhongMaterial. (clj->js {:color 0x55ddee}))
        cube     (js/THREE.Mesh. geometry material)
        animate  (fn cb [] 
                  (js/requestAnimationFrame cb)
                  (set! (.. cube -rotation -x) (+ 0.01 (.. cube -rotation -x)))
                  (set! (.. cube -rotation -y) (+ 0.02 (.. cube -rotation -y)))
                  (.render renderer scene camera))
      ]
    (.setSize renderer width height)
    ;(aset camera "aspect" (/ width height))
    (set! (.-aspect camera) (/ width height))
    (.updateProjectionMatrix camera)

    (set! (.-background scene) skyboxtexture) ;(js/THREE.Color. 0xAAAAFF))
    
    (.add scene cube)
    (.add scene light)
    (.add scene (js/THREE.AmbientLight. 0x101010))
    (.set (.. camera -position) 0 0 10)
    (.set (.. light -position) 20 100 10)
    (.set (.. light -target -position) 0 0 0)

    (animate)
    (.addEventListener js/window "resize" on-window-resize)
  )
)




(main)
