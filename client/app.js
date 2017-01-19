(function(){

  var width = 100
  var height = 100
  var connectionStatus = false
  var dataLoaded = false

  function activate_page(){
    if(!dataLoaded){
      dataLoaded = true
      load_data(build_page)
    }
    $('#preloader').hide()
  }

  function disable_page(){
    $('#preloader').show()
  }

  function load_data(done){
    $.get('/v1/logos', function(data){

      var ret = data.map(function(st){
        var parts = st.split(':')
        return {
          x:parts[0],
          y:parts[1]
        }
      })

      done(ret)
    
    })
  }

  function add_data(x, y, done){
    $.post('/v1/logos', x + ':' + y, done)
  }

  function check_status(done){
    $.get('/v1/ping', function(data){
      connectionStatus = data.connected

      if(connectionStatus){
        activate_page()
      }
      else{
        disable_page()
      }

      setTimeout(check_status, 1000)
    })
  }

  function add_logo(x, y, animate){
    var holder = document.getElementById('holder')
    var elem = document.createElement('div')
    $(elem).addClass('logo')
    $(elem).css({
      left:x + 'px',
      top:y + 'px',
      width:width + 'px',
      height:height + 'px'
    })
    if(animate){
      $(elem).addClass('animated tada');  
    }
    holder.appendChild(elem)
    $('#clickmessage').hide()
  }

  // will put the logos on the screen as per state
  function build_page(data){
    data.forEach(function(pos){
      add_logo(pos.x, pos.y)
    })
  }

  function handle_click(e){
    if(!connectionStatus) return
    var offset = $(this).offset();
    var x = e.pageX - offset.left - (width/2);
    var y = e.pageY - offset.top - (height/2);
    add_data(x, y, function(){
      add_logo(x, y, true)
    })
  }

  $(function(){
    $('#preloader').show()
    $('#clickmessage').show()
    $('#holder').click(handle_click)
    check_status()
  })

})()
