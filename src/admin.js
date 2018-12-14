function login(){
	var password= document.querySelector('input.password').value;
	
	//TODO: check password using wrapkend servers: clone repo, check config file
	if(!!password){
		login_success();
	}

	function login_success(){
		var el = document.querySelector('section.admin_login');
		el.parentElement.removeChild(el);
		//TODO: Redirect to admin menu
	}
	function login_fail(){
		window.alert('Invalid password');
	}
}
function logout(){
	//TODO: redirect to home screen
	//window.location.href="/";
}