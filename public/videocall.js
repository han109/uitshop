var socket=io("https://uitshopserver.herokuapp.com/");

let customConfig;

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "ngochan",
    secret: "ee406ed4-2de4-11e8-aba7-c5f3d248a5fe",
    domain: "uitshop.com",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});


socket.on("server-send-fail-admin",function(){
	alert("Tên đã tồn tại, vui lòng chọn 1 tên khác");
});

socket.on("server-send-ok-admin",function(data){
    const{ten, peerId}=data;
	$("#currentUseradmin").html(ten);
	$("#VideoCall").show();
	$("#LoginFormcall").hide();

});


socket.on("server-call",function(peerID){
    $(`#${peerID}`).hide();
});

socket.on("server-stop-call",function(peerID){
    $(`#${peerID}`).show();
});

socket.on("server-send-listUserOnline-admin",function(data){
	$("#boxContentadmin").html("");
	data.forEach(function(user){
		const{ten, peerId}=user;
        //console.log(${peerId});
		$('#boxContentadmin').append(`<div class="user"><img  width="10px" src="on.png"> ${ten} <img id="${peerId}" width="15px" src="incoming-call_318-56547.jpg"></div>`);

	});
});

socket.on("server-send-disconnect-admin",peerId => {
        $(`#${peerId}`).remove();
    });

socket.on("server-send-disconnect-client",data=> {
    data.forEach(function(user){
        const{idclient, idadmin}=user;
        $(`#${idclient}`).remove();
        $(`#${idadmin}`).show();
    });
});

$(document).ready(function () {

	$("#VideoCall").hide();
	$("#LoginFormcall").show();

    $("#VideoCallclient").hide();
    $("#UserOnlineadminclient").hide();


	function openStream() {
	    const config = { audio: true, video: true };
    	return navigator.mediaDevices.getUserMedia(config);
	}

	function playStream(idVideoTag, stream) {
    	const video = document.getElementById(idVideoTag);
    	video.srcObject = stream;
    	video.play();
	}
	//const peer= new Peer ({key: '5b9y3hw2f1ug14i'});
    const peer = new Peer({ 
    key: 'peerjs', 
    host: 'uitshopstream.herokuapp.com', 
    secure: true, 
    port: 443, 
    config: customConfig 
});

	peer.on('open', id => {
   		$("#id-peer").append(id);

   		$("#btnSignUp").click(function(){
    		if($("#txtUsername").val()=="")
	       	{
                alert("vui lòng nhập tên");
		    }
		     else{
			     const user=$("#txtUsername").val();
		
			     socket.emit("client-send-username-admin", { ten: user, peerId: id });
			
		    }
	   });
        $('#thamgia').click(function(){

            $("#VideoCallclient").show();
            $("#UserOnlineadminclient").show();
            $("#thamgia").hide();
            socket.emit("client-send-id",id);
        });

        $('#Stoptcall').click(function(){
            alert("Bạn muốn kết thúc cuộc trò chuyện");
            socket.emit("stop-call",id);
    });
});
	

//Callee
	peer.on('call', call => {
    	openStream()
    	.then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
	$('#boxContentadmin').on('click', 'img', function() {
    const id = $(this).attr('id');
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        socket.emit("client-call-admin",id);
    });
});
});