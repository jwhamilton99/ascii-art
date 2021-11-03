let characters = ["&nbsp",".",":","-","=","+","*","#","%","@"];

function getRawText() {
	var text = document.getElementById("output").innerHTML;
	text = text.replace(/&nbsp;/gm, " ");
	text = text.replace(/<br>/gm, "\n");
	return text;
}

function copyText() {
	navigator.clipboard.writeText(getRawText());
}

function saveText() {
	var blob = new Blob([getRawText()],{
		type:"text/plain;charset=utf-8"
	});
	window.location = (window.webkitURL.createObjectURL(blob));

}

var invert = false;
var bold = false;

function toggleOutputBold() {
	bold = !bold;
	updateOutputColors();
	document.getElementById("boldButton").innerHTML = (bold) ? "normal" : "bold";
}

function toggleOutputColors() {
	invert = !invert;
	updateOutputColors();
	document.getElementById("invertButton").innerHTML = (invert) ? "black on white" : "white on black";
}

function updateOutputColors() {
	document.getElementById("outputContainer").style.backgroundColor = (invert) ? "black" : "white";
	document.getElementById("output").style.color = (invert) ? "white" : "black";
	document.getElementById("output").style.fontWeight = (bold) ? "bold" : "normal";
}

function displayImage(values) {
	console.log("creating output...");
	output = ""
	for(row of values) {
		output = output + (row.map(getCharacter).toString())+"<br>";
	}
	output = output.replace(/,/g," ");
	return output;
}

function getCharacter(num) {
	return characters[num];
}

function processRow(canvas, ctx, y) {
	row = []
	for(var x = 0; x < canvas.width; x++) {
		let data = ctx.getImageData(x, y, 1, 1).data;
		avg = (data[0]+data[1]+data[2])/3;
		row.push(Math.floor((avg*characters.length)/256));
	}
	return row;
}

function processImage(canvas, ctx) {
	console.log("processing image");
	var output = [];
	for(var y = 0; y < canvas.height; y++) {
		row = processRow(canvas, ctx, y);
		output.push(row);
	}
	return displayImage(output);
}

function createCanvas(image) {
	console.log("creating canvas");
	var canvas = document.createElement("canvas");
	canvas.width = document.getElementById("width").value;
	canvas.height = document.getElementById("height").value;
	
	let ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0,0, document.getElementById("width").value, document.getElementById("height").value);
	
	return processImage(canvas, ctx);
}

function createImage(e) {
	var image = new Image();
	image.src = e.target.result;
	
	image.onload = function() {
		if((document.getElementById("width").value == "" && document.getElementById("height").value == "") || document.getElementById("imagePreview").src != e.target.result) {
			var maxDim = Math.max(image.width, image.height);
			
			if(maxDim > 300) {
				if(image.width == maxDim) {
					image.height = Math.round((image.height*300)/image.width);
					image.width = 300;
					alert("your image is wider than the maximum (300px), and has been resized to "+image.width+"x"+image.height+"px.");
				} else if(image.height == maxDim) {
					image.width = Math.round((image.width*300)/image.height);
					image.height = 300;
					alert("your image is taller than the maximum (300px), and has been resized to "+image.width+"x"+image.height+"px.");
				}
			}
			
			document.getElementById("width").value = image.width;
			document.getElementById("height").value = image.height;
			document.getElementById("controls").style.display = "block";
			document.getElementById("outputContainer").style.display = "block";
			document.getElementById("imagePreviewContainer").style.display = "block";
		}
		
		document.getElementById("imagePreview").src = e.target.result;
		
		var output = createCanvas(image);
		document.getElementById("output").style.fontSize = document.getElementById("fontsize").value+"px";
		document.getElementById("output").innerHTML = output;
		document.getElementById("status").innerHTML = "";
		console.log("finished!");
	}
}

function updateFontSize() {
	document.getElementById("output").style.fontSize = document.getElementById("fontsize").value+"px";
}

var file;

function setImageName(e) {
	if(e.target.files.length > 0) {
		file = e.target.files[0];
		document.getElementById("fileName").innerHTML = file.name;
	}
	document.getElementById("hiddenUploadItem").removeEventListener("change", setImageName);
	document.getElementById("hiddenUploadItem").style.display = "block";
}

function selectImage() {
	var upload = document.getElementById("hiddenUploadItem");
	upload.style.display = "block";
	upload.addEventListener("change", setImageName);
	upload.addEventListener("input", setImageName);
	upload.click();
}

function loadImage() {
	let reader = new FileReader();
	
	reader.addEventListener("load", createImage);
	
	if(file == undefined || (!file.type.includes("jpeg") && !file.type.includes("png"))) {
		alert("please select a JPG or PNG image");
		return;
	}
	
	document.getElementById("width").value = Math.max(1,document.getElementById("width").value);
	document.getElementById("height").value = Math.max(1,document.getElementById("height").value);
	document.getElementById("fontsize").value = Math.max(1,document.getElementById("fontsize").value);
	
	document.getElementById("status").innerHTML = "processing...";
	
	updateOutputColors();
	
	reader.readAsDataURL(file);
}