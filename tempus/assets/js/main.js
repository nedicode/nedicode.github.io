
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


	var app = {
		navigate: function(hash){
			

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
								'0.0.1'
							))
							document.title = "About";
							Title.innerHTML = "About";
						break;

						case 'point':
							app.point(hashParams.id)
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

						
						function ColItem(data){
							
							return crEl('div', {c:'carousel-item', s:'height:100%'},
								crEl('div', {c:'card-panel blue white-text', s:'margin-top:0; position:relative; padding:8px 8px 16px 8px;'},
									crEl('h2', {c:'blue-text text-lighten-4'}, data.FCTTIME.mday + '\u00a0' + data.FCTTIME.month_name_abbrev+' \u00a0 ' , crEl('span', data.FCTTIME.hour_padded + ':' + data.FCTTIME.min)),
									
									crEl('input',{type:'image', c:'btn-floating btn-large waves-effect waves-light btn-white white', s:'padding:8px; position:absolute; bottom:-25px; right:16px', src:data.icon_url}),
									
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
						
						
					//	$.getJSON("//api.wunderground.com/api/5b9d8c009d00057d/hourly/lang:RU/q/" + result.rows[0].lat + "," + result.rows[0].lon + ".json",
$(						function(w){
						
						w = 
{
  "response": {
  "version":"0.1",
  "termsofService":"http://www.wunderground.com/weather/api/d/terms.html",
  "features": {
  "hourly": 1
  }
	}
		,
	"hourly_forecast": [
		{
		"FCTTIME": {
		"hour": "10","hour_padded": "10","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480662000","pretty": "02 12, 2016 10:00 MSK","civil": "10:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "21", "metric": "-6"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "99",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "ЮЮВ", "degrees": "153"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "80",
		"windchill": {"english": "12", "metric": "-11"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "12", "metric": "-11"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "0",
		"mslp": {"english": "29.98", "metric": "1015"}
		}
		,
		{
		"FCTTIME": {
		"hour": "11","hour_padded": "11","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480665600","pretty": "02 12, 2016 11:00 MSK","civil": "11:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "21", "metric": "-6"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "99",
		"wspd": {"english": "8", "metric": "13"},
		"wdir": {"dir": "ЮЮВ", "degrees": "153"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "79",
		"windchill": {"english": "12", "metric": "-11"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "12", "metric": "-11"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "0",
		"mslp": {"english": "29.97", "metric": "1015"}
		}
		,
		{
		"FCTTIME": {
		"hour": "12","hour_padded": "12","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480669200","pretty": "02 12, 2016 12:00 MSK","civil": "12:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "22", "metric": "-6"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "98",
		"wspd": {"english": "9", "metric": "14"},
		"wdir": {"dir": "ЮЮВ", "degrees": "152"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "78",
		"windchill": {"english": "11", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "11", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "0",
		"mslp": {"english": "29.95", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "13","hour_padded": "13","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480672800","pretty": "02 12, 2016 13:00 MSK","civil": "1:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "95",
		"wspd": {"english": "10", "metric": "16"},
		"wdir": {"dir": "ЮЮВ", "degrees": "151"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "79",
		"windchill": {"english": "8", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "8", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "0",
		"mslp": {"english": "29.95", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "14","hour_padded": "14","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480676400","pretty": "02 12, 2016 14:00 MSK","civil": "2:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "21", "metric": "-6"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "95",
		"wspd": {"english": "10", "metric": "16"},
		"wdir": {"dir": "ЮЮВ", "degrees": "150"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "78",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "13",
		"mslp": {"english": "29.94", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "15","hour_padded": "15","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480680000","pretty": "02 12, 2016 15:00 MSK","civil": "3:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "21", "metric": "-6"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/cloudy.gif",
		"fctcode": "4",
		"sky": "95",
		"wspd": {"english": "10", "metric": "16"},
		"wdir": {"dir": "ЮЮВ", "degrees": "149"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "78",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "16",
		"mslp": {"english": "29.93", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "16","hour_padded": "16","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480683600","pretty": "02 12, 2016 16:00 MSK","civil": "4:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "96",
		"wspd": {"english": "10", "metric": "16"},
		"wdir": {"dir": "ЮЮВ", "degrees": "149"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "80",
		"windchill": {"english": "8", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "8", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "15",
		"mslp": {"english": "29.93", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "17","hour_padded": "17","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480687200","pretty": "02 12, 2016 17:00 MSK","civil": "5:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "98",
		"wspd": {"english": "10", "metric": "16"},
		"wdir": {"dir": "ЮЮВ", "degrees": "149"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "82",
		"windchill": {"english": "8", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "8", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "5",
		"mslp": {"english": "29.93", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "18","hour_padded": "18","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480690800","pretty": "02 12, 2016 18:00 MSK","civil": "6:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "100",
		"wspd": {"english": "9", "metric": "14"},
		"wdir": {"dir": "ЮЮВ", "degrees": "150"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "83",
		"windchill": {"english": "9", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "9", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "24",
		"mslp": {"english": "29.93", "metric": "1014"}
		}
		,
		{
		"FCTTIME": {
		"hour": "19","hour_padded": "19","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480694400","pretty": "02 12, 2016 19:00 MSK","civil": "7:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "100",
		"wspd": {"english": "8", "metric": "13"},
		"wdir": {"dir": "ЮВ", "degrees": "145"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "85",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "24",
		"mslp": {"english": "29.92", "metric": "1013"}
		}
		,
		{
		"FCTTIME": {
		"hour": "20","hour_padded": "20","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480698000","pretty": "02 12, 2016 20:00 MSK","civil": "8:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "20", "metric": "-7"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Снег",
		"icon": "snow",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_snow.gif",
		"fctcode": "19",
		"sky": "100",
		"wspd": {"english": "8", "metric": "13"},
		"wdir": {"dir": "ЮВ", "degrees": "145"},
		"wx": "Местами снегопад",
		"uvi": "0",
		"humidity": "86",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.1", "metric": "3"},
		"pop": "30",
		"mslp": {"english": "29.92", "metric": "1013"}
		}
		,
		{
		"FCTTIME": {
		"hour": "21","hour_padded": "21","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480701600","pretty": "02 12, 2016 21:00 MSK","civil": "9:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "19", "metric": "-7"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "99",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "ЮВ", "degrees": "146"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "23",
		"mslp": {"english": "29.91", "metric": "1013"}
		}
		,
		{
		"FCTTIME": {
		"hour": "22","hour_padded": "22","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480705200","pretty": "02 12, 2016 22:00 MSK","civil": "10:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "19", "metric": "-7"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "97",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "ЮВ", "degrees": "141"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "89",
		"windchill": {"english": "11", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "11", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "23",
		"mslp": {"english": "29.9", "metric": "1013"}
		}
		,
		{
		"FCTTIME": {
		"hour": "23","hour_padded": "23","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "2","mday_padded": "02","yday": "336","isdst": "0","epoch": "1480708800","pretty": "02 12, 2016 23:00 MSK","civil": "11:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Пятница","weekday_name_night": "В Ночь на Субботу","weekday_name_abbrev": "Пт","weekday_name_unlang": "Friday","weekday_name_night_unlang": "Friday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "19", "metric": "-7"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "93",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "ЮВ", "degrees": "138"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "88",
		"windchill": {"english": "11", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "11", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "24",
		"mslp": {"english": "29.9", "metric": "1013"}
		}
		,
		{
		"FCTTIME": {
		"hour": "0","hour_padded": "00","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480712400","pretty": "03 12, 2016 00:00 MSK","civil": "12:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "18", "metric": "-8"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "90",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "ЮВ", "degrees": "133"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "90",
		"windchill": {"english": "9", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "9", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.89", "metric": "1012"}
		}
		,
		{
		"FCTTIME": {
		"hour": "1","hour_padded": "01","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480716000","pretty": "03 12, 2016 01:00 MSK","civil": "1:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "18", "metric": "-8"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "90",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "ЮВ", "degrees": "126"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "92",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.88", "metric": "1012"}
		}
		,
		{
		"FCTTIME": {
		"hour": "2","hour_padded": "02","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480719600","pretty": "03 12, 2016 02:00 MSK","civil": "2:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "17", "metric": "-8"},
		"dewpoint": {"english": "16", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "92",
		"wspd": {"english": "3", "metric": "5"},
		"wdir": {"dir": "ВЮВ", "degrees": "108"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "94",
		"windchill": {"english": "-9999", "metric": "-9999"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "17", "metric": "-8"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.87", "metric": "1012"}
		}
		,
		{
		"FCTTIME": {
		"hour": "3","hour_padded": "03","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480723200","pretty": "03 12, 2016 03:00 MSK","civil": "3:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "16", "metric": "-9"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Пасмурно",
		"icon": "cloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_cloudy.gif",
		"fctcode": "4",
		"sky": "92",
		"wspd": {"english": "3", "metric": "5"},
		"wdir": {"dir": "В", "degrees": "90"},
		"wx": "Облачно",
		"uvi": "0",
		"humidity": "95",
		"windchill": {"english": "-9999", "metric": "-9999"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "16", "metric": "-9"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.86", "metric": "1011"}
		}
		,
		{
		"FCTTIME": {
		"hour": "4","hour_padded": "04","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480726800","pretty": "03 12, 2016 04:00 MSK","civil": "4:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "16", "metric": "-9"},
		"dewpoint": {"english": "14", "metric": "-10"},
		"condition": "Облачно",
		"icon": "mostlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_mostlycloudy.gif",
		"fctcode": "3",
		"sky": "77",
		"wspd": {"english": "4", "metric": "6"},
		"wdir": {"dir": "ВСВ", "degrees": "72"},
		"wx": "Преимущественно облачно",
		"uvi": "0",
		"humidity": "91",
		"windchill": {"english": "9", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "9", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.85", "metric": "1011"}
		}
		,
		{
		"FCTTIME": {
		"hour": "5","hour_padded": "05","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480730400","pretty": "03 12, 2016 05:00 MSK","civil": "5:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "15", "metric": "-9"},
		"dewpoint": {"english": "12", "metric": "-11"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "52",
		"wspd": {"english": "4", "metric": "6"},
		"wdir": {"dir": "ВСВ", "degrees": "62"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "9", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "9", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.83", "metric": "1010"}
		}
		,
		{
		"FCTTIME": {
		"hour": "6","hour_padded": "06","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480734000","pretty": "03 12, 2016 06:00 MSK","civil": "6:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "14", "metric": "-10"},
		"dewpoint": {"english": "11", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "36",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "ВСВ", "degrees": "63"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "86",
		"windchill": {"english": "5", "metric": "-15"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "5", "metric": "-15"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.82", "metric": "1010"}
		}
		,
		{
		"FCTTIME": {
		"hour": "7","hour_padded": "07","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480737600","pretty": "03 12, 2016 07:00 MSK","civil": "7:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "12", "metric": "-11"},
		"dewpoint": {"english": "10", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "42",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "55"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "88",
		"windchill": {"english": "4", "metric": "-16"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "4", "metric": "-16"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.82", "metric": "1010"}
		}
		,
		{
		"FCTTIME": {
		"hour": "8","hour_padded": "08","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480741200","pretty": "03 12, 2016 08:00 MSK","civil": "8:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "11", "metric": "-12"},
		"dewpoint": {"english": "8", "metric": "-13"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "59",
		"wspd": {"english": "4", "metric": "6"},
		"wdir": {"dir": "СВ", "degrees": "50"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "91",
		"windchill": {"english": "3", "metric": "-16"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "3", "metric": "-16"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.82", "metric": "1010"}
		}
		,
		{
		"FCTTIME": {
		"hour": "9","hour_padded": "09","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480744800","pretty": "03 12, 2016 09:00 MSK","civil": "9:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "11", "metric": "-12"},
		"dewpoint": {"english": "9", "metric": "-13"},
		"condition": "Облачно",
		"icon": "mostlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/mostlycloudy.gif",
		"fctcode": "3",
		"sky": "66",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "47"},
		"wx": "Преимущественно облачно",
		"uvi": "0",
		"humidity": "92",
		"windchill": {"english": "2", "metric": "-17"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "2", "metric": "-17"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.81", "metric": "1009"}
		}
		,
		{
		"FCTTIME": {
		"hour": "10","hour_padded": "10","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480748400","pretty": "03 12, 2016 10:00 MSK","civil": "10:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "13", "metric": "-11"},
		"dewpoint": {"english": "11", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "57",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "52"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "89",
		"windchill": {"english": "4", "metric": "-16"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "4", "metric": "-16"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.8", "metric": "1009"}
		}
		,
		{
		"FCTTIME": {
		"hour": "11","hour_padded": "11","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480752000","pretty": "03 12, 2016 11:00 MSK","civil": "11:00 AM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "AM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "15", "metric": "-9"},
		"dewpoint": {"english": "12", "metric": "-11"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "45",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "41"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "88",
		"windchill": {"english": "8", "metric": "-13"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "8", "metric": "-13"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.79", "metric": "1009"}
		}
		,
		{
		"FCTTIME": {
		"hour": "12","hour_padded": "12","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480755600","pretty": "03 12, 2016 12:00 MSK","civil": "12:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "17", "metric": "-8"},
		"dewpoint": {"english": "14", "metric": "-10"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "38",
		"wspd": {"english": "4", "metric": "6"},
		"wdir": {"dir": "СВ", "degrees": "39"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "11", "metric": "-11"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "11", "metric": "-11"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "6",
		"mslp": {"english": "29.78", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "13","hour_padded": "13","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480759200","pretty": "03 12, 2016 13:00 MSK","civil": "1:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "18", "metric": "-8"},
		"dewpoint": {"english": "15", "metric": "-9"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "38",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "36"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "88",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "6",
		"mslp": {"english": "29.77", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "14","hour_padded": "14","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480762800","pretty": "03 12, 2016 14:00 MSK","civil": "2:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "17", "metric": "-8"},
		"dewpoint": {"english": "14", "metric": "-10"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "39",
		"wspd": {"english": "5", "metric": "8"},
		"wdir": {"dir": "СВ", "degrees": "37"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "10", "metric": "-12"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "10", "metric": "-12"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.77", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "15","hour_padded": "15","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480766400","pretty": "03 12, 2016 15:00 MSK","civil": "3:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "16", "metric": "-9"},
		"dewpoint": {"english": "12", "metric": "-11"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/partlycloudy.gif",
		"fctcode": "2",
		"sky": "41",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "СВ", "degrees": "35"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "85",
		"windchill": {"english": "7", "metric": "-14"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "7", "metric": "-14"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.77", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "16","hour_padded": "16","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480770000","pretty": "03 12, 2016 16:00 MSK","civil": "4:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "15", "metric": "-9"},
		"dewpoint": {"english": "11", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "45",
		"wspd": {"english": "6", "metric": "10"},
		"wdir": {"dir": "СВ", "degrees": "37"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "85",
		"windchill": {"english": "7", "metric": "-14"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "7", "metric": "-14"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.77", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "17","hour_padded": "17","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480773600","pretty": "03 12, 2016 17:00 MSK","civil": "5:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "14", "metric": "-10"},
		"dewpoint": {"english": "11", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "51",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "СВ", "degrees": "38"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "4", "metric": "-16"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "4", "metric": "-16"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "7",
		"mslp": {"english": "29.78", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "18","hour_padded": "18","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480777200","pretty": "03 12, 2016 18:00 MSK","civil": "6:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "12", "metric": "-11"},
		"dewpoint": {"english": "10", "metric": "-12"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "54",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "СВ", "degrees": "43"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "89",
		"windchill": {"english": "2", "metric": "-17"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "2", "metric": "-17"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.78", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "19","hour_padded": "19","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480780800","pretty": "03 12, 2016 19:00 MSK","civil": "7:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "12", "metric": "-11"},
		"dewpoint": {"english": "9", "metric": "-13"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "54",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "СВ", "degrees": "40"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "87",
		"windchill": {"english": "2", "metric": "-17"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "2", "metric": "-17"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.78", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "20","hour_padded": "20","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480784400","pretty": "03 12, 2016 20:00 MSK","civil": "8:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "11", "metric": "-12"},
		"dewpoint": {"english": "8", "metric": "-13"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "52",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "СВ", "degrees": "38"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "89",
		"windchill": {"english": "-1", "metric": "-18"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "-1", "metric": "-18"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.78", "metric": "1008"}
		}
		,
		{
		"FCTTIME": {
		"hour": "21","hour_padded": "21","min": "00","min_unpadded": "0","sec": "0","year": "2016","mon": "12","mon_padded": "12","mon_abbrev": "Dec","mday": "3","mday_padded": "03","yday": "337","isdst": "0","epoch": "1480788000","pretty": "03 12, 2016 21:00 MSK","civil": "9:00 PM","month_name": "Декабрь","month_name_abbrev": "Дек","weekday_name": "Суббота","weekday_name_night": "В ночь на Воскресенье","weekday_name_abbrev": "Сб","weekday_name_unlang": "Saturday","weekday_name_night_unlang": "Saturday Night","ampm": "PM","tz": "","age": "","UTCDATE": ""
		},
		"temp": {"english": "10", "metric": "-12"},
		"dewpoint": {"english": "7", "metric": "-14"},
		"condition": "Небольшая Облачность",
		"icon": "partlycloudy",
		"icon_url":"http://icons.wxug.com/i/c/k/nt_partlycloudy.gif",
		"fctcode": "2",
		"sky": "52",
		"wspd": {"english": "7", "metric": "11"},
		"wdir": {"dir": "СВ", "degrees": "45"},
		"wx": "Переменная облачность",
		"uvi": "0",
		"humidity": "86",
		"windchill": {"english": "-1", "metric": "-18"},
		"heatindex": {"english": "-9999", "metric": "-9999"},
		"feelslike": {"english": "-1", "metric": "-18"},
		"qpf": {"english": "0.0", "metric": "0"},
		"snow": {"english": "0.0", "metric": "0"},
		"pop": "8",
		"mslp": {"english": "29.79", "metric": "1009"}
		}
	]
}

						
							if( w && w.hourly_forecast ){
								
								var slider = crEl('div',{c:'carousel carousel-slider center', d:{indicators:true}});
								w.hourly_forecast.forEach(function(hp){
									slider.appendChild(new ColItem(hp))
								});
								
								Content.appendChild(slider)
								$(slider).carousel({full_width: true});
								$(slider).height($(window).height() - $("#baseNavbar").height())
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
		

		
		
