
console.log("***** main.js loaded");

const videoElement = document.querySelector("video");
const audioSelect = $("#menu > .options > li:first");
const videoSelect = $("#menu > .options > li:eq(1)");

const btn_screencap = document.querySelector("button#btn-screencap");
const captureVideoButton = document.querySelector("button#captureVideoButton");

const paperCanvas = document.querySelector("#paper_canvas");



initListeners();


$(function ($) {
	navigator.mediaDevices
		.enumerateDevices()
		.then(gotDevices)
		.then(getStream)
		.catch(handleError);
});





/* ******************** Drawing Tools ******************** */




function gotDevices(deviceInfos) {
	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];

		const option = $("<li>").addClass("btn").data({
			mediaSource: true
		});

		if (deviceInfo.kind === "audioinput") {
			var audioID =
				deviceInfo.deviceId.length > 0
					? deviceInfo.deviceId
					: "default";

			option.data().value = audioID;
			option.html(
				"<p>" + deviceInfo.label ||
					"Microphone " + (audioSelect.length + 1) + "</p>"
			);
			$(".menu .settings:first-of-type").append(option);
		} else if (deviceInfo.kind === "videoinput") {
			option.data().value = audioID;
			option.html(
				"<p>" + deviceInfo.label ||
					"Camera " + (videoSelect.length + 1) + "</p>"
			);
			$(".menu .settings:last-of-type").append(option);
		} else {
			//console.log("Found another kind of device: ", deviceInfo);
		}
	}
}

function getStream() {
	if (window.stream) {
		window.stream.getTracks().forEach(function (track) {
			track.stop();
		});
	}

	const constraints = {
		audio: {
			deviceId: { exact: audioSelect.value }
		},
		video: {
			deviceId: { exact: videoSelect.value },
			width: { min: 480, ideal: 1280 },
			height: { min: 270, ideal: 720 },
			advanced: [
				{ width: 1920, height: 1080 },
				{
					aspectRatio: 16 / 9
				}
			]
		}
	};

	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(gotStream)
		.catch(handleError);
}

function gotStream(stream) {
	window.stream = stream; // make stream available to console
	videoElement.srcObject = stream;

	var capabilities = stream.getVideoTracks()[0].getCapabilities();
	/* for(var ability in capabilities) {
		if(capabilities.hasOwnProperty(capabilities)) {
			console.log(ability+" =>");
			console.log(capabilities[ability]);
		}
		else {
			console.log(ability+" =>");
			console.log(capabilities[ability]);
		}
	} */
	/* var supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
	for(var constraint in supportedConstraints) {
		if(supportedConstraints.hasOwnProperty(constraint)) {
			console.log(constraint+" | "+ supportedConstraints[constraint]);
		}
		else {
			console.log(constraint+" | "+ supportedConstraints[constraint]);
		}
	} */

	const app = document.querySelector("#app");
	app.style.maxWidth = capabilities.width.max + "px";
}

function whichCamera(track) {
	return track.getSettings().facingMode;
}

function handleError(error) {
	console.error("Error: ", error);
}

function handleSuccess(stream) {
	btn_screencap.disabled = false;
	videoElement.srcObject = stream;
}

function handleImageCapture(state) {
	const video = document.querySelector("#stage video");
	const imgRenderer = document.querySelector("#overlay canvas.img-renderer");
	
	var image = $("<img>")
		.attr("src", "")

	switch(state) {
		case 'video' :
			imgRenderer.getContext("2d").clearRect(0, 0, imgRenderer.width, imgRenderer.height);
			imgRenderer.width = videoElement.videoWidth;
			imgRenderer.height = videoElement.videoHeight;

			paperCanvas.width = videoElement.videoWidth;
			paperCanvas.height = videoElement.videoHeight;
			
			imgRenderer.getContext("2d").drawImage(video, 0, 0);

			// Other browsers will fall back to image/png
			image.attr("src", imgRenderer.toDataURL("image/webp"));

			$("#overlay img").remove();
		break;

		case 'annotation' :
			imgRenderer.getContext("2d").drawImage(paperCanvas, 0, 0);

			image.toggleClass("hidden", true);
			image.attr("src", imgRenderer.toDataURL("image/webp"));

		break;
	}
	
	image.appendTo("#overlay");
	$("#overlay").toggleClass("hidden", false);

	return image;
}

function initListeners() {
	/* $(document).on("change", "select#audioSource, select#videoSource", function (e) {
			getStream();
	}); */
	/* $("#stage").height($("#stage > video:first").height(true));
	console.log($("#stage > video:first").outerHeight(true));
	$(document).on("resize", function (e) {
		$("#stage").height($("#stage > video:first").outerHeight(true));
	}); */

	$(document).on("click", ".menu > .btn-toggle", function (e) {
		$(this).parent().toggleClass("closed");
	});

	$(document).on("click", "#menu .options > .btn", function (e) {
		var index = $(this).index();
		var isSelected = $(this).hasClass("selected");
		$(this).toggleClass("selected", !isSelected);
		$("#menu .settings").toggleClass("hidden", true);
		$("#menu .settings:eq(" + index + ")").toggleClass(
			"hidden",
			isSelected
		);
	});

	$(document).on("click", "#menu .settings > .btn", function (e) {
		var isSelected = $(this).hasClass("selected");
		$(this).siblings().toggleClass("selected", false);
		$(this).toggleClass("selected", true);

		var attr = $(this).attr("[data-mediaSource]");

		if (attr != undefined && attr !== false) {
			getStream();
		}
	});

	$(document).on("click", ".app #btn-photo", function (e) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(handleSuccess)
			.catch(handleError);
	});

	/* $(document).on("click", ".btn-hide", function (e) {
		e.preventDefault();
		$($(this).data().target).hide();
	}); */
}
