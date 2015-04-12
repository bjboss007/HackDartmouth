Router.configure({
  layoutTemplate: 'mainLayout',
  templateNameConverter: 'upperCamelCase'
});

Router.map(function() {
  this.route('frontpage', {
    path: '/'
  });
  
  this.route('onedrive', {
    path: '/onedrive'
  });
  
  this.route('upload', {
    path: '/upload'
  });
  
  this.route('UI', {
     path: '/UI' 
  });
  
});