// einmaliger Aufruf, sobald Webseite "fertig" ist
// Auslagerung in Funktion (keine Anonyme mehr)
$(document).ready(websiteIsReady);
function websiteIsReady(jQuery) {
	registerSocket();
}

// Socket für die Registrierung
function registerSocket() {
	var socket  = io.connect('http://localhost', 4003);
	
	// register User
	$('#register').click(function() {
		if ($('#register_name').val() == '' || $('#register_mail').val() == '' || $('#register_password').val() == '') {
			return alert('Please enter all data!');
		}
		var data = {
			name: $('#register_name').val(),
			mail: $('#register_mail').val(),
			password: $('#register_password').val()
		};
		socket.emit('add user', data);
		$('#register_name').val('');
		$('#register_mail').val('');
		$('#register_password').val('');
	});

	// User-Login
	$('#login').click(function() {
		if ($('#login_name').val() == '' || $('#login_password').val() == '') {
			return alert('Please enter all data!');
		}
		var data = {
			name: $('#login_name').val(),
			password: $('#login_password').val()
		};
		socket.emit('userlogin', data);
		$('#login_name').val('');
		$('#login_password').val('');
	});
	
	socket.on('is_logged_in', function(session) {
		$('#info').html(session.userInfo.name);
		//if (session.is_logged_in)
		//	$('#info').html('User '+ session.userInfo +' ist eingeloggt!');
		//else
		//	$('#info').html('Fehler beim Login! Bitte versuchen Sie es erneut!');
	});
	
	// Anzeige aller User, die übergeben werden
	//socket.on('populate', function(data) {
	//	var out = "";
	//	$.each(data, function(i, obj) {
	//		out += "<li>"+obj.name+" / "+obj.email+"</li>";
	//	});
	//	$('#users').html(out);
	//});
}