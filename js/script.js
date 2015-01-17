//***************************************
// Script file for the SketchPad page
//***************************************

//	Globals constants and variables
const minSize = 10;
const maxSize = 125;
oldSize = curSize = 16;	
curDiv = true;
curColor = '#0080C0';	
curPenType = 'SOLID';

$(document).ready(function() {
			
	//	Callback function for clearing the canvas
	$('#clear').click(function() {
		if(!confirm('Do you really want to clear your sketch?')) 
			return;
			
		var cells = $('.cell');
		cells.css({'background-color':$('#container').css('background-color'),
				   'opacity':1.0});
		cells.attr({'value': ''});
	});

	//	Callback function for validating the canvas' resolution on getting focus
	$('#canvas-size').focus(function() {
		var value = $(this).val();
		if(!isNaN(value) && value >= minSize && value <= maxSize)
			oldSize = value;
	});
	
	//	Callback function for validating the canvas' resolution on losing focus
	$('#canvas-size').blur(function() {
		var value = $(this).val();
		if(isNaN(value) || value < minSize || value > maxSize)
			$(this).val(oldSize);
	});
	
	//	Callback function for building a new canvas' grid
	$('#new').click(function() {
		var size = $('#canvas-size').val();
		
		if(isNaN(size)){
			alert('The canvas resolution must be a numeric value!!!');
			return;
		}
		else if(size < minSize || size > maxSize){
			alert('The canvas resolution must be between '+minSize+' and '+maxSize+' cells!');
			return;
		}
		
		if(!confirm('Do you want to build a new canvas?'))
			return;
		
		curSize = size;
		resetCanvas();
		initCanvas(curSize);
	});
	
	// Callback function for toggling the outline of cells
	$('#show-div').click(function() {
		var cells = $('.cell');
		cells.toggleClass('outlined-cell');
		curDiv = !curDiv;
	});
		
	// Callback function for changing the current pen color
	$('#pen-color').change(function() {
		curColor = $(this).val();
	});
	
	// Callback function for changing the current pen style
	$('.pen-type').change(function() {
		curPenType = $(this).val();
		$('#pen-color').attr({'disabled':curPenType === 'RANDOM'});
		
		//	Remove the previous style handler and set a new one
		$('.cell').off('mouseenter');
		switch(curPenType) {
			case 'SOLID':
				$('.cell').on('mouseenter', onSolidStyle); 
				break;
			case 'INCREMENTAL':
				$('.cell').on('mouseenter', onIncrementalStyle); 
				break;
			case 'RANDOM':
				$('.cell').on('mouseenter', onRandomStyle); 
				break;
		}
	});
	
	//	Initializes UI elements and the initial canvas
	initInputElements(curSize, curDiv, curColor, curPenType);
	initCanvas(curSize);
});

//	Sets the UI input elements with initial values
function initInputElements(size, show, color, style) {
	//	Canvas resolution - text
	$('#canvas-size').val(size);
	//	Show divisions - check box
	$('#show-div').attr({'checked':show});
	//	Pen color - color picker
	$('#pen-color').val(color);
	//	Pen style - radio buttons
	$('.pen-type').filter("[value="+style+"]").attr({'checked':true});
}

//	Removes all the cells from the container
function resetCanvas() {
	$('#container').empty();
}

//	Initializes a canvas with a given resolution (size x size)
function initCanvas(size) {
	var showDivs = $('#show-div').is(':checked',true);
	var containerSize = $('#container').width();
	var cellSize = containerSize / size;
	cellSize += "px";
	
	for(var i = 0; i < size; i++) {
		for(var j = 0; j < size; j++) {
			var cell = $('<div class="cell"></div>');
			cell.attr({'value':''});
			cell.css({'width':cellSize,
					  'height':cellSize,
					 });
			if(showDivs)
				cell.addClass('outlined-cell');
			if(j === 0) 
				cell.addClass('row-first-cell');
			$('#container').append(cell);
		}
	}
	//	Sets the initial 'mouseenter' event handler for the cells
	$('.pen-type').filter(':checked', true).triggerHandler('change');
	$('#resolution').text('('+size+' x '+size+')');
}

//	Callback function for drawing on the sketch pad with a solid color (default style)
function onSolidStyle() {
	// The cell color is the current pen color
	var color = curColor;
	// The cell opacity value is 1
	var opacity = 1.0;
	
	// Attribute 'value' holds the background-color in hex format; css returns it in rgb format
	$(this).attr({'value':color});	
	$(this).css({'background-color':color,
				 'opacity':opacity});
}

//	Callback function for drawing on the sketch pad with accumulative colors
function onIncrementalStyle() {
	// The cell color is the current pen color
	var color = curColor;
	
	// The cell opacity gets incremented in 10% every pass, until reaching saturation on 1.0
	var cellColor = $(this).attr('value');
	var opacity  = Number($(this).css('opacity'));
	
	opacity = cellColor !== curColor ? 0.1 : (opacity >= 1.0 ? 1.0 : opacity + 0.1);
	
	// Attribute 'value' holds the background-color in hex format; css returns it in rgb format
	$(this).attr({'value':color});	
	$(this).css({'background-color':color,
				 'opacity':opacity});
}

//	Callback function for drawing on the sketch pad with random colors
function onRandomStyle() {
	// Each cell color RGB component is randomly determined in the (0,255) range
	// and converted into an hex string
	var color = '#'+toHex(Math.floor(Math.random()*256))+
					toHex(Math.floor(Math.random()*256))+
					toHex(Math.floor(Math.random()*256));
	
	// The cell opacity value is 1
	var opacity = 1.0;
		
	// Attribute 'value' holds the background-color in hex format; css returns it in rgb format
	$(this).attr({'value':color});	
	$(this).css({'background-color':color,
				 'opacity':opacity});
}

//	Helper function to convert a decimal number in range (0-255) 
//	into a 2-digits hexadecimal string
function toHex(number) {
	var value = number.toString(16);
    if( (value.length % 2) > 0 ){ value = "0" + value; }
    return value;
}