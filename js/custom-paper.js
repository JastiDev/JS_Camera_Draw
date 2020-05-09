
console.log("***** custom-paper.js loaded");


paper.install(window);

$(function ($) {

	var enableEditing = false;
	

	paper.setup("paper_canvas");
	
	var drawTool = new Tool();
		drawTool.minDistance = 10;
	var rectTool = new Tool();
		rectTool.minDistance = 20;
	var ellipseTool = new Tool();
		ellipseTool.minDistance = 20;
	var arrowTool = new Tool();
		arrowTool.minDistance = 20;
	
	var textTool = new Tool();
	var selectTool = new Tool();
	
	var path, text;

	var strokeWidth = strokeWidthBase = 5;
	var strokeColor = '#000000';

	var fontSizes = ["2rem","3rem","4rem","5rem","6rem"];
	var fontSize = fontSizes[0];

	$.each($(""))
	


	$(document).on("mouseup", "#taskbar [data-options].selected", function (e) {
		$("#taskbar .options").toggleClass("hidden");
	});

	$(document).on("mouseup", "#taskbar button", function (e) {
		$(this).siblings("button").toggleClass("selected", false);
		$(this).toggleClass("selected", true);
	});

	$(document).on("mouseup", "#taskbar button[data-tool]", function (e) {
		var tool = $(this).data().tool;
		switch(tool) {
			case "draw":
				drawTool.activate();
			break;
			case "rectangle":
				rectTool.activate();
			break;
			case "ellipse":
				ellipseTool.activate();
			break;
			case "text":
				textTool.activate();
			break;
			case "arrow":
				arrowTool.activate();
			break;
			case "select":
				selectTool.activate();
			break;
		}
	});

	$(document).on("mouseup", "#taskbar .options [data-stroke]", function (e) {
		var stroke = parseInt($(this).data().stroke);
		strokeWidth = strokeWidthBase * stroke;
		fontSize = fontSizes[stroke-1];

		if(text != undefined && text != null) {
			text.fillColor = strokeColor;
			text.fontSize = fontSize;
		}
	});

	$(document).on("mouseup", "#taskbar .options [data-swatch]", function (e) {
		var swatch = $(this).data().swatch;
		strokeColor = swatch;
		
		if(text != undefined && text != null) {
			text.fillColor = strokeColor;
			text.fontSize = fontSize;
		}
	});

	$(document).on("click", "#taskbar #btn-trash", function (e) {
		var selectedItems = project.selectedItems;

		$.each(selectedItems, function(index, obj) {
			obj.remove();
		});

		$(this).toggleClass("hidden",true);

		if(project.activeLayer.isEmpty()) {
			$("#taskbar #btn-select").toggleClass("hidden", true);
			$("#taskbar #btn-draw").toggleClass("selected", true);
			$("#taskbar #btn-send").toggleClass("disabled", true);
			drawTool.activate();
		}
		else {
			$("#taskbar #btn-select").toggleClass("selected", true);
			$("#taskbar #btn-send").toggleClass("disabled", false);
			selectTool.activate();
		}
		
	});

	$(document).on("click", "#taskbar .btn-tray", function (e) {
		var isOpen = $(this).hasClass("open");
		$(this).toggleClass("open");
		$(this).siblings(".inner").toggleClass("open");
		$(this).siblings(".inner").children(".row.tools").toggleClass("hidden", isOpen);
		$(this).siblings(".inner").children(".row.options").toggleClass("hidden", true);
	});

	$(document).on("click", "#taskbar #btn-screencap", function (e) {
		handleImageCapture('video');
		$(this).parent().children(":not(#btn-trash):not(#btn-select)").toggleClass("hidden");
		
		$("#taskbar #btn-draw").toggleClass("selected", true);
		drawTool.activate();
	});

	$(document).on("click", "#taskbar #btn-close", function (e) {
		$("#overlay").toggleClass("hidden", true);
		$("#taskbar btn-tray").trigger("click");
		$("#taskbar .inner button").toggleClass("selected", false);
		$("#taskbar .inner button").toggleClass("hidden", true);
		$("#taskbar .inner .options").toggleClass("hidden", true);

		$("#taskbar #btn-screencap").toggleClass("hidden", false);
		$("#overlay img").remove();
		
		project.activeLayer.removeChildren();
		
		path = null;
		text = null;
	});

	$(document).on("click", "#taskbar #btn-send", function (e) {
		$(this).toggleClass("selected", false);
		var image = handleImageCapture('annotation');
		
		//send image via Twillio

		//setTimeout(function() {
			//image.remove();
		//},3000);
		
		$("#taskbar #btn-select").toggleClass("hidden", true);
		$("#taskbar #btn-draw").toggleClass("selected", true);
		$("#taskbar #btn-send").toggleClass("disabled", true);
		drawTool.activate();
		

		//$("#taskbar #btn-close").trigger('click');
	})


	/* **************************************** DRAW TOOL ****************************** */

	selectTool.onMouseUp = function(event) {
		var hit = project.hitTest(event.point);
		var selectedItems = project.selectedItems;

		if(hit != null) {
			hit.item.selected = true;
			if(!event.event.shiftKey) {
				$.each(selectedItems, function(index, obj) {
					obj.selected = false;
				});
			}
			//hit.item.remove();
		}
		else if(!event.event.shiftKey) {
			$.each(selectedItems, function(index, obj) {
				obj.selected = false;
			});
		}

		$("#taskbar #btn-trash").toggleClass("hidden", project.selectedItems.length < 1);
	};

	drawTool.onMouseUp = function(event) {
		$("#taskbar #btn-select").toggleClass("hidden", project.activeLayer.isEmpty());
		$("#taskbar #btn-send").toggleClass("disabled", project.activeLayer.isEmpty());
	};

	drawTool.onMouseDown = function(event) {
		path = new Path();
		path.strokeColor = strokeColor;
		path.strokeWidth = strokeWidth;
		path.strokeCap = 'round';
		path.strokeJoin = 'round';
		path.add(event.point);
	}

	drawTool.onMouseDrag = function(event) {
		path.add(event.point);
	}


	/* **************************************** Rectangle TOOL ****************************** */
	
	rectTool.onMouseUp = function(event) {
		var rect = new Path.Rectangle({
			from: event.downPoint,
			to: event.point
		});
		rect.strokeColor = strokeColor;
		rect.strokeWidth = strokeWidth;
		rect.strokeCap = 'round';
		rect.strokeJoin = 'round';

		$("#taskbar #btn-select").toggleClass("hidden", project.activeLayer.isEmpty());
		$("#taskbar #btn-send").toggleClass("disabled", project.activeLayer.isEmpty());
	};

	rectTool.onMouseDown = function(event) {
		mouseDown = true;
		path = new Path();
		path.strokeColor = strokeColor;
		path.strokeWidth = strokeWidth;
		path.strokeCap = 'round';
		path.strokeJoin = 'round';
		path.add(event.point);
	}

	rectTool.onMouseDrag = function(event) {
	
	}


	/* **************************************** Circle TOOL ****************************** */

	ellipseTool.onMouseUp = function(event) {
		var ellipse = new Path.Circle({
			center: event.middlePoint,
			radius: event.delta.length / 2
		});
		ellipse.strokeColor = strokeColor;
		ellipse.strokeWidth = strokeWidth;
		ellipse.strokeCap = 'round';
		ellipse.strokeJoin = 'round';
		/* circle.fillColor = 'white'; */

		$("#taskbar #btn-select").toggleClass("hidden", project.activeLayer.isEmpty());
		$("#taskbar #btn-send").toggleClass("disabled", project.activeLayer.isEmpty());
	};

	ellipseTool.onMouseDown = function(event) {
		/* path = new Path();
		path.strokeColor = strokeColor;
		path.strokeWidth = strokeWidth;
		path.strokeCap = 'round';
		path.strokeJoin = 'round';
		path.add(event.point); */
	}

	ellipseTool.onMouseDrag = function(event) {
		/* path.add(event.point); */
	}


	/* **************************************** Arrow TOOL ****************************** */

	arrowTool.onMouseUp = function(event) {
		$("#taskbar #btn-select").toggleClass("hidden", project.activeLayer.isEmpty());
		$("#taskbar #btn-send").toggleClass("disabled", project.activeLayer.isEmpty());
	};

	arrowTool.onMouseDown = function(event) {
		
	}

	arrowTool.onMouseDrag = function(event) {
		
	}

	

	/* **************************************** Arrow TOOL ****************************** */

	textTool.onMouseUp = function(event) {
		$("#taskbar #btn-select").toggleClass("hidden", project.activeLayer.isEmpty());
		$("#taskbar #btn-send").toggleClass("disabled", project.activeLayer.isEmpty());
		
		
		text = new PointText(event.point);
		text.fillColor = strokeColor;
		text.fontSize = fontSize;
		// Set the content of the text item:
		text.addChild(
			new Path.Star({
				center: [event.point.x-20, event.point.y-10],
				points: 5,
				radius1: 4,
				radius2: 8,
				fillColor: "#ffb183"
			})
		);
		
		text.addChild(
			new PointText({
				content: "| ",
				point: [event.point.x-10, event.point.y],
				fontSize: fontSize,
				fillColor: "#ffb183"
			})
		);
		text.content = '';
	};

	textTool.onMouseDown = function(event) {
		
	}

	textTool.onKeyUp = function(event) {
		text.content += event.character;
	}
});


