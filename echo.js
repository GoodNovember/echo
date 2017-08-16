var rootElm = document.getElementById("app")
var startButton = document.getElementById("startButton")
var cvs = document.getElementById("display")
var audContext = correctAudioContext()
var actx = new audContext()
var vctx = cvs.getContext("2d")

var visualizerNode = actx.createAnalyser()

var rawFloatArray

startButton.onclick = function(){
	console.log("Start!")
	getPermissions().then(toggle)
}

function toggle(){
	rootElm.classList.toggle("stopped")
	rootElm.classList.toggle("started")
}

function getPermissions(){
	var constraints = {
		audio: true, video: false
	}
	return navigator.mediaDevices.getUserMedia(constraints).then(function(data){
		// console.log("DATA", data)
		var mediaStreamSource = actx.createMediaStreamSource(data)
		// console.log("BAP", mediaStreamSource)
		mediaStreamSource.connect(visualizerNode)
		console.log(visualizerNode)
		rawFloatArray = new Float32Array(visualizerNode.frequencyBinCount)
		beginVisualization()
	})
}

function correctAudioContext(){
	return (window.AudioContext || window.webkitAudioContext)
}



function beginVisualization(){

	var threshhold = 1

	function heartbeat(timestamp){
		visualizerNode.getFloatFrequencyData(rawFloatArray)

		sizeCanvas()

		var yPos = cvs.height -1

		var xPos = 0

		rawFloatArray.forEach(function(value, index, arr){
			var val = (threshhold - value) / 100
			vctx.beginPath()
			vctx.fillStyle = `hsl(${(val)*360},100%, 50%)`
			vctx.rect(xPos, yPos, 1,1)
			vctx.fill()
			xPos++
			if(index +1 === arr.length){
				bleedUp()
			}
		})
		// yPos++
		requestAnimationFrame(heartbeat)
	}
	requestAnimationFrame(heartbeat)

	function bleedUp(){
		var imgData = vctx.getImageData(0,0,1024, vctx.canvas.height)
		vctx.putImageData(imgData, 0,-1 * getDPR())
	}

	function sizeCanvas(){
		var parent = cvs.parentNode;
		var targetWidth =  1024
		var targetHeight = parent.clientHeight * getDPR()
		if(cvs.width !== targetWidth || cvs.height !== targetHeight){
			cvs.width = targetWidth
			cvs.height = targetHeight
			return true
		}else{
			return false
		}
	}

	function getDPR(){
		return window.devicePixelRatio || 1
	}

}