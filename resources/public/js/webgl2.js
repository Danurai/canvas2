main();

function main () {
  
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl");
  
  const vsSource = `
    attribute vec4 aVertexPosition;
    
    void main() {
      gl_Position = aVertexPosition;
    }
  `;
  
  const fsSource = `
    precision highp float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.5, 1.0);
    }
  `;
  
  
  const shaderProgram = createProgram(gl, vsSource, fsSource);
  
  var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  
  const positionBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  
  gl.enableVertexAttribArray(positionAttributeLocation);
  
  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);
  
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.useProgram(shaderProgram);
  
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var vertexCount = 3;
  
  gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}


function createProgram(gl, vsSource, fsSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
  var program = gl.createProgram();
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function createShader(gl, type, source) { //loadShader
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) { 
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}
