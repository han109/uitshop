var socket=io("https://uitshopserver.herokuapp.com/");


socket.on("server-send-fail",function(){
	alert("Tên đã tồn tại, vui lòng chọn 1 tên khác");
});

socket.on("server-send-ok",function(data){
	$("#currentUser").html(data);
	$("#LoginForm").hide();
	$("#ChatForm").show();
});

socket.on("server-send-disconnect",function(){
	$("#LoginForm").show();
	$("#ChatForm").hide();
	alert("Bạn đã mất kết nối, vui lòng nhập tên để tiếp tục");

});


socket.on("server-send-listUserOnline",function(data){
	$("#boxContent").html("");
	data.forEach(function(i){
		$("#boxContent").append("<div class='user'>"+ "<img width='10px' src='on.png'> "+i +"</div>");
	});
});

socket.on("server-send-message",function(data){
	$("#listMessages").append("<div class='message'>"+data.username+": " + data.message+"</div>");
});

socket.on("server-send-typing",function(){
	$("#userTyping").html("<img width='30px' src='typing-indicator.gif'>");
});

socket.on("server-send-stop-typing",function(data){
	$("#userTyping").html("");
});

socket.on('stream',function(image){
var img=document.getElementById("play");
img.src=image;
var log=document.getElementById("logger");
log.text(image);
});



$(document).ready(function () {
	$("#LoginForm").show();
	$("#ChatForm").hide();

	$("#btnRegister").click(function(){
		if($("#txtusername").val()=="")
		{
			alert("vui lòng nhập tên");
		}
		else{
		socket.emit("client-send-username",$("#txtusername").val());}
		});

	$("#txtMessages").keypress(function(event){
		if(event.which==13){
			if($("#txtMessages").val()!=""){
				socket.emit("user-send-message",$("#txtMessages").val());
				$("#txtMessages").val("");}
		}
	});

	$("#txtMessages").focusin(function(){
		socket.emit("typing");
	});

	$("#txtMessages").focusout(function(){
		socket.emit("stop-typing");
	});
	
	
	var canvas=document.getElementById("preview");
	var context=canvas.getContext("2d");
	canvas.width =350;
	canvas.height =350;
	context.width =canvas.width;
	context.height =canvas.height;
	var video=document.getElementById("video");
			
	function logger(msg) {
		$("#logger").text(msg);
	}

	function loadCam(stream)
	{
		video.src=window.URL.createObjectURL(stream);
		logger('Đang phát LiveStream');
	}
	function loadFail(){
		logger('Lỗi phát LiveStream');
	}
	function viewVideo(video,context)
	{
		context.drawImage(video,0,0,context.width,context.height);
		socket.emit('stream',canvas.toDataURL('image/webp'));
		}

	$("#Startstream").click(function(){

		navigator.getUserMedia=(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia);
		if(navigator.getUserMedia)
		{
			navigator.getUserMedia({video:true, audio: true},loadCam,loadFail);
		}
			/*navigator.mediaDevices.getUserMedia({audio: true, video: true})
			.then(stream=>{
			video.srcObject = stream;
			video.onloadmetadata=function(){
			video.play();
				}
			});*/
    									
   									
		setInterval(function(){
		viewVideo(video,context);
		},70);
	});



});