
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
		//Footer.style.display = 'none'
		app.navigate()
	});


window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        alert('Script Error: See Browser Console for Detail');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        alert(message);
    }

    return false;
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
		
	var app = {
		navigate: function(hash){
			
				navRight.innerHTML = ''
				var hashParams = {};
				var e,
					a = /\+/g,  // Regex for replacing addition symbol with a space
					r = /([^&;=]+)=?([^&;]*)/g,
					d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
					q = window.location.hash.substring(1);

				while (e = r.exec(q)) hashParams[d(e[1])] = d(e[2]);

				if( hashParams.v && hashParams.v.length ){
					switch(hashParams.v){
						case 'about':
							Content.innerHTML = '';
							Content.appendChild(crEl('div',{s:'padding:20px; text-align:center'},
								"TEMPUS", crEl('br'),
								'weather aggregator', crEl('br'),
								'0.0.3'
							))
							document.title = "About";
							Title.innerHTML = "About";
						break;

						case 'point':
							app.point(hashParams.id)
						break;



					}
				} else {
					Content.innerHTML = '';
					Content.appendChild(crEl('div',{c:'fixed-action-btn', s:'bottom: 45px; right: 24px;'},
						crEl('button',{c:'btn-floating btn-large red', e:{click: function(){
							app.addPoint()
						}}},new MIcon('add_location'))
					))
					
					var List = crEl('div', {c:'collection'})
					app.db.transaction(function(tx) {
						tx.executeSql("SELECT id, name FROM points", [], function(tx, result){
							if(result.rows && result.rows.length){
								for(var i=0; i<result.rows.length; i++){
									List.appendChild(crEl('a',{c:'waves-effect collection-item',href:'#v=point&id=' + result.rows[i].id}, crEl('div',{c:'secondary-content'},new MIcon('place')),
									crEl('strong',result.rows[i].name)));
								}
							} else {
								Content.appendChild(crEl('div',{s:'padding:20px; text-align:center'},'Add at least one point'));
							}
							Content.appendChild(List)
						}, app.sqlError);
					})
							
					
					
					
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
			}}},'\u00a0') // new MIcon('create')
		))
		
		

		Content.innerHTML = '';

		document.getElementById("searchClear").onclick = function(){
			document.getElementById("search").value = "";
			searchNavbar.classList.toggle('hide')
			baseNavbar.classList.toggle('hide')
		
		}

		Sidebar.innerHTML = '';
		Sidebar.appendChild(crEl('li', crEl('div',{s:'padding:40px 20px; margin-bottom:16px; line-height:16px', c:'blue white-text'}, crEl('strong',{s:'font-size:30px; font-weight:200'},'TEMPUS'), crEl('br'),crEl('small',{s:'font-size:13px; font-weight:200; opacity:0.8'},'\u00a0 weather aggregator'))))
		
		Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'javascript:app.addPoint()'}, new MIcon('add_location'),'Add location')));
		Sidebar.appendChild(crEl('li',{c:'divider'}))
		
		
		app.db.transaction(function(tx) {
			tx.executeSql("SELECT id, name FROM points", [], function(tx, result){
				if(result.rows && result.rows.length){
					for(var i=0; i<result.rows.length; i++){
						Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'#v=point&id=' + result.rows[i].id}, new MIcon('place'),result.rows[i].name)));
					}
				}
				Sidebar.appendChild(crEl('li',{c:'divider'}))
				Sidebar.appendChild(crEl('li', crEl('a',{c:'waves-effect',href:'#v=about'}, 'About')));
				$("#sidebarCollapser").sideNav({closeOnClick: true });
			}, app.sqlError);
		})
		
		


		
		


		app.addPoint = function(){
		
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position){
							lat = position.coords.latitude
							lon = position.coords.longitude

							app.db.transaction(function(tx) {
								tx.executeSql("INSERT INTO points (name, lat, lon) values(?,?,?)", [prompt('Name of location:', 'Home, sweet home'), lat, lon], function(tx, result){

									app.msg("Success","success")
									location.href='#v=point&id='+result.insertId
								}, app.sqlError);
							})

						});
					} else {
						alert('geolocation is not available')
					}

		}
		
		app.point = function(id){
			Content.innerHTML = '';

			
		

			app.db.transaction(function(tx) {
				tx.executeSql("SELECT id, name, lat, lon FROM points WHERE id=" + id, [], function(tx, result){
				
					if(result.rows && result.rows.length){
						document.title = result.rows[0].name;
						Title.innerHTML = result.rows[0].name;

						
						
						navRight.innerHTML = ''
						navRight.appendChild(crEl('li',
							crEl('a',{href:'javascript:void(0)', id:'initSearch', e:{click: function(){
								if(confirm('Are you sure you want to delete?')){
									app.db.transaction(function(tx) {
										tx.executeSql("DELETE FROM points WHERE id=" + id, [], function(tx, result){
											location.href='#'
										})
									})
								}
							}}},new MIcon('delete')) // new MIcon('create')
						))
						
						
						
						function ColItem(data){
							
							return crEl('div', {c:'carousel-item', s:'height:100%'},
								crEl('div', {c:'card-panel blue white-text', s:'margin-top:0; position:relative; padding:8px 8px 16px 8px;'},
									crEl('h2', {c:'blue-text text-lighten-4'}, data.FCTTIME.mday + '\u00a0' + data.FCTTIME.month_name_abbrev+' \u00a0 ' , crEl('span', data.FCTTIME.hour_padded + ':' + data.FCTTIME.min)),
									
									crEl('input',{type:'image', c:'btn-floating btn-large waves-effect waves-light btn-white white', s:'padding:8px; position:absolute; bottom:-25px; right:16px', src:data.icon_url.replace(/http\:/i, 'https:')}),
									
								//	crEl('div',),
									crEl('h3', {s:'font-weight:200'}, data.condition),
									crEl('h1', {c:data.temp.metric<0?'white-text':'white-text', s:'margin:0'}, data.temp.metric + '°С ', 
									crEl('sup',{c:'blue-text text-lighten-4 pull-right', s:'font-weight:100; font-size:15px'},data.feelslike.metric + '°С ' ))
								),
								crEl('div',{s:' display: block; width:auto; padding: 20px; font-size:24px; text-align:left; line-height:24px;'},
									crEl('div', {s:'line-height:24px; padding:8px;'}, 
										new MIcon('toys',{c:'md-18'}), 
										' \u00a0 '+data.wspd.metric +'\u00a0м/с  ' , crEl('small', {c:'grey-text'}, data.wdir.dir) ,' \u00a0',
										//crEl('span',{s:'display:inline-block; width:24px; height:24px; position:relative'},
											crEl('span',{s:'position:absolute;  width:24px height:24px; transform:rotate(' + (+data.wdir.degrees) + 'deg);'}, new MIcon('navigation'))
										//)
									),
									crEl('div',  {s:'line-height:24px; padding:8px; white-space:no-wrap;  text-overflow: ellipsis;'}, new MIcon('filter_drama',{c:'md-18'}), ' \u00a0 '+data.sky + '% ', crEl('small',{c:'grey-text'},'(' + data.wx +')')),
									crEl('div',  {s:'line-height:24px; padding:8px;'}, new MIcon('opacity',{c:'md-18'}), ' \u00a0 '+data.humidity + '%  '),
									crEl('div',  {s:'line-height:24px; padding:8px;'}, new MIcon('file_upload',{c:'md-18'}), ' \u00a0 '+Math.round(0.75006375541921 * data.mslp.metric) + "\u00a0мм р.ст.")
									
								)
								
							)
						}
						
						
					$.getJSON("//api.wunderground.com/api/5b9d8c009d00057d/hourly/lang:RU/q/" + result.rows[0].lat + "," + result.rows[0].lon + ".json",function(w){
						

						
							if( w && w.hourly_forecast ){
								
								var slider = crEl('div',{c:'carousel carousel-slider center', d:{indicators:true}});
								
								var cData = [], minD=null, maxD=null;
								w.hourly_forecast.forEach(function(hp){
									slider.appendChild(new ColItem(hp));
									//var d = hp.FCTTIME.mday + ' ' + hp.FCTTIME.month_name_abbrev+' ' + hp.FCTTIME.hour_padded + ':' + hp.FCTTIME.min;
									if(!minD || minD>hp.FCTTIME.epoch){minD = hp.FCTTIME.epoch}
									if(!maxD || maxD<hp.FCTTIME.epoch){maxD = hp.FCTTIME.epoch}
									cData.push([new Date(hp.FCTTIME.epoch*1000), +hp.temp.metric, +hp.feelslike.metric])
								});
								
								slider.appendChild(crEl('div',{c:'carousel-item', s:'padding:20px',id:'firstSl'}));
								
								
								Content.appendChild(slider)
								$(slider).carousel({full_width: true});
								$(slider).height($(window).height() - $("#baseNavbar").height())
								
								
									document.getElementById("firstSl").appendChild(crEl('div', {id:'chart_div'}));
									
									
									google.charts.load('current', {'packages':['corechart']});
									  google.charts.setOnLoadCallback(drawChart);

									  function drawChart() {
										var data = new google.visualization.DataTable();
										data.addColumn('datetime', 'Время');
										data.addColumn('number', 'Температура факт');
										data.addColumn('number', 'Температура по ощущениям');
										data.addRows(cData);
								  
										// The intervals data as narrow lines (useful for showing raw source data)
										var options_lines = {
											title: 'График температур',
											curveType: 'function',
											lineWidth: 3,
											intervals: { 'style':'line' },
											legend: { position: 'bottom' },
											height: 400,
											chartArea: {
											  width: '85%'
											},
											hAxis: {
												  viewWindow: {
													min: new Date(minD*1000),
													max: new Date(maxD*1000)
												  },
												  gridlines: {
													count: -1,
													units: {
													  days: {format: ['MMM dd']},
													  hours: {format: ['HH:mm', 'ha']},
													}
												  },
												  minorGridlines: {
													units: {
													  hours: {format: ['hh:mm:ss a', 'ha']},
													  minutes: {format: ['HH:mm a Z', ':mm']}
													}
												  }
											}
										};
								  
										var chart_lines = new google.visualization.LineChart(document.getElementById('chart_div'));
										chart_lines.draw(data, options_lines);
									  }
									
									
								
								
								
							}
							
							
							
							
							
						
								
								
							
							
						})
						
						//5b9d8c009d00057d wunderground
						/*
							$.getJSON('//api.accuweather.com/locations/v1/cities/geoposition/search.json', {q: lat+','+lon, language:'ru', apikey:'QFeewtOzWzhjM1wws1d4eUAP1j9oeKTA'}, function(w){
								console.info(w)
							})						
							$.getJSON('https://api.weather.yandex.ru/v1/forecast', {units:'metric',lat:point.lat, lon: point.lon, extra:'true', lang:'ru'}, function(w){
								console.info(w)
							})						
						*/
						




						
					}

				}, app.sqlError);
			})
			
			
			
			
		}
		

		
		
