
	var Content = document.getElementById('content');
	var Navbar	= document.getElementById('navbar');
	var Sidebar = document.getElementById('sidebar');
	var Title	= document.getElementById('navTitle');
	var Footer	= document.getElementById('footer');
	var searchNavbar= document.getElementById('searchNavbar');
	var baseNavbar	= document.getElementById('baseNavbar');
	var navRight	= document.getElementById('navRight');



	window.addEventListener('load', function() {
		window.addEventListener('hashchange', app.navigate);
		document.addEventListener('visibilitychange', function() {
		  if(document.hidden) {
			console.log('save')
		  }
		});
		Footer.style.display = 'none'
		app.navigate()
	});





	var app = {
		navigate: function(hash){
			

				var hashParams = {};
				var e,
					a = /\+/g,  // Regex for replacing addition symbol with a space
					r = /([^&;=]+)=?([^&;]*)/g,
					d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
					q = window.location.hash.substring(1);

				while (e = r.exec(q)) hashParams[d(e[1])] = d(e[2]);

				if(hashParams.v){
					switch(hashParams.v){
						case 'about':
						


						break;
					}
				}
				
			
		},
		msg: function(str, duration, c, callback){
			Materialize.toast(str, duration || 3000, c || '', callback || function(){return false;})
		},
		modal: function(param, callback){
			var index =  $('.modal').length + 1;
			var id = param.id || ('modal'+index.toString());
			$('#'+id).remove();
			if(param.buttons){
				var footer = crEl('div',{c:'modal-footer'});
				for(var i=0, l= param.buttons.length; i<l; i++){
					//param.buttons[i].onclick = function(){$(".lean-overlay").remove()}
					footer.appendChild(param.buttons[i])
				}
			}
			document.body.appendChild(crEl('div',{id:id, class:'modal '+ (param.c || '')},
				crEl('div',{c:'modal-content'}, param.content),
				footer || ''
			));
			return new Promise(function(resolve, reject) {

			
				
				$('#' + id ).openModal({
					in_duration: param.in_duration || 350,
					out_duration: param.out_duration || 250,
					dismissible: !!(param.dismissible  || true),
					opacity: param.opacity || .5,
					ready: function() {
						resolve(id);
						if(typeof(callback)=='function'){callback(id)} 
					},
					complete: function() {
						
						setTimeout( function(){ $('#' + id ).remove(); }, 1);
					}
				})
			
			//	$('#modal1').openModal();
			//	$('#modal1').closeModal();

			})
			
			
		},
		
		alert: function(message, alertCallback, title, buttonName){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.alert)!=='undefined'){
				navigator.notification.alert(message, alertCallback, title, buttonName);	
			}
		},
		confirm: function(message, confirmCallback, title, buttonLabels){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.confirm)!=='undefined'){
				navigator.notification.confirm(message, confirmCallback, title, buttonLabels);	
			}	
		},
		prompt: function(message, promptCallback, title, buttonLabels, defaultText){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.prompt)!=='undefined'){
				navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);	
			}	
		},
		beep: function(times){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.beep)!=='undefined'){
				navigator.notification.beep(times);	
			}
		},	
		vibrate: function(milliseconds){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.vibrate)!=='undefined'){
				navigator.notification.vibrate(milliseconds);	
			}
		}
	};		

		var ls = {
			set:function(key,value){window.localStorage.setItem(key, value)},
			get:function(key){return window.localStorage.getItem(key)},
			unset:function(key){ window.localStorage.removeItem(key)},
			clear:function(){window.localStorage.clear();}
		}

		var MIcon = function(name, attrs){
			var e = crEl('i', attrs, name);
			e.classList.add('material-icons');
			return e;
		}
		
		try {
			app.db = openDatabase("base","0.1","Основная база кеша приложения", 2 * 1024 * 1024);
			console.log(app.db)
		} catch(e) {
			// Error handling code goes here.
			if (e == 2) {
				// Version number mismatch.
				alert("Invalid database version.");
			} else {
				alert("Unknown error "+e+".");
			}
		   
		}
 
		if(!app.db){alert("Failed to connect to database.");}

		app.error = function(d){
			console.error(d)
		}

		app.db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS points (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, lat REAL, lon REAL, color TEXT);", [], console.log, app.error);
			tx.executeSql("CREATE TABLE IF NOT EXISTS notes (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, id_point INTEGER, date INTEGER, temp REAL);", [], null, null);
		});

		app.sqlError =  function(tx,res){
		console.error(tx,res)
			if(res && res.error){
				alert(res.error)
			}
		}
		
		document.title = "Tempus";
		Title.innerHTML = "Tempus";
		
		navRight.innerHTML = ''
		navRight.appendChild(crEl('li',
			crEl('a',{href:'javascript:void(0)', id:'initSearch', e:{click: function(){
				searchNavbar.classList.toggle('hide')
				baseNavbar.classList.toggle('hide')
				document.getElementById("search").focus();
				document.getElementById("searchForm").onsubmit = function(){
					Content.appendChild(crEl('p', document.getElementById("search").value))
					document.getElementById("search").value = "";
					document.getElementById("search").focus()
				}
			}}}, new MIcon('create'))
		))
		
		

		Content.innerHTML = '';

		document.getElementById("searchClear").onclick = function(){
			document.getElementById("search").value = "";
			searchNavbar.classList.toggle('hide')
			baseNavbar.classList.toggle('hide')
		
		}

		Sidebar.innerHTML = '';
		Sidebar.appendChild(crEl('li', crEl('div',{s:'padding:40px 20px; margin-bottom:16px; line-height:16px', c:'blue white-text'}, crEl('strong',{s:'font-size:30px; font-weight:200'},'TEMPUS'), crEl('br'),crEl('small',{s:'font-size:13px; font-weight:200; opacity:0.8'},'\u00a0 weather aggregator'))))
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'javascript:app.addPoint()'}, 'Add location')));
		Sidebar.appendChild(crEl('li',{c:'divider'}))
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'#about'}, 'О программе')));

		$("#sidebarCollapser").sideNav({closeOnClick: true });
		



	/*	
		app.db.transaction(function(tx) {
			tx.executeSql("SELECT name FROM travel where id=" + id, [], function(tx, result){
				document.title = result.rows[0].name;
				Title.innerHTML = result.rows[0].name;

			}, app.sqlError);
		})
		*/
		
		app.addPoint = function(){
		
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position){
							lat = position.coords.latitude
							lon = position.coords.longitude

							app.db.transaction(function(tx) {
								tx.executeSql("INSERT INTO points (name, lat, lon) values(?,?,?)", [prompt('Name of location:', 'Home, sweet home'), lat, lon], function(tx, result){
									app.msg("Success","success")
								}, app.sqlError);
							})

						});
					} else {
						alert('geolocation is not available')
					}
		
		}
		
		var slider = crEl('div',{c:'carousel carousel-slider center', d:{indicators:true}});
		Content.appendChild(slider)

			app.db.transaction(function(tx) {
				tx.executeSql("SELECT id, name, lat, lon FROM points", [], function(tx, result){
					if(result.rows && result.rows.length){
						function Slide(point){
							var div = crEl('div',{c:'carousel-item'},
								crEl('h2', point.name)
							)
						$.getJSON('http://api.openweathermap.org/data/2.5/weather', {units:'metric',lat:point.lat, lon: point.lon, APPID:'cd86e235fc7c0bcac549923298b74a71', lang:'ru'}, function(w){
							if(w && w.weather){
								div.appendChild(crEl('div',{s:'text-align:left; opacity:0.8'}, crEl('small','openweather')))	
								div.appendChild(crEl('div', crEl('strong',{c:'text-transform:uppercase'}, w.weather.description)))	
								div.appendChild(crEl('div', crEl('img',{src:'http://openweathermap.org/img/w/'  + w.weather.icon +  '.png'})))
								div.appendChild(crEl('div', 
									crEl('strong', 't ' + w.main.temp + '\u00a0°С; ' ), 
									crEl('small','h: ' + w.main.humidity + "%; "), 
									crEl('small','h: ' + Math.round(0.75006375541921 * w.main.pressure) + "мм р.ст.; ") 
								))								
								div.appendChild(crEl('div', 
									crEl('small','wind:\u00a0'),w.wind.speed +'\u00a0м/с', '\u00a0', crEl('small', w.wind.deg+'°') , '\u00a0',crEl('span',{s:'position:absolute;transform:rotate(' + (w.wind.deg-135) + 'deg)'},'➷'),
									crEl('small',' \u00a0 clouds:\u00a0' + w.clouds.all +'%')
								))	
								
								div.appendChild(crEl('div', 
									crEl('small','sun:\u00a0'), 
										
										new Date(w.sys.sunset).toTimeString().substr(0,5), '/',
										new Date(w.sys.sunrise).toTimeString().substr(0,5)
									)
								))	
							}
						})
						
						$.getJSON('https://api.weather.yandex.ru/v1/forecast', {units:'metric',lat:point.lat, lon: point.lon, extra:'true', lang:'ru'}, function(w){
							console.info(w)
						})						

						
						
						
							return div;
						}
						for(var i=0; i<result.rows.length; i++){
							slider.appendChild(new Slide(result.rows[i]))
						}
						$(slider).carousel({full_width: true});
					}

				}, app.sqlError);
			})
		
		
