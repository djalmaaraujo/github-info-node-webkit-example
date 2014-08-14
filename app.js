var request    = require('request');
var GITHUB_API = 'https://api.github.com';

$(function () {
  $(document).foundation();

  var makeRequest = function (where, cb) {
    userData = JSON.parse(localStorage.getItem('user_data'));
    cache    = JSON.parse(localStorage.getItem('cache'));

    if (cache.login == userData.username) {
      return cb(false, false, cache);
    }

    return request({
      url: GITHUB_API + where,
      method: 'GET',
      auth: {
        username: userData.username,
        password: userData.password
      },
      json: true,
      headers: {
        'User-Agent': 'Awesome-Octocat-App'
      }
    }, cb);
  };

  $('.page-auth form').on('valid', function (e) {
    var form           = $(e.currentTarget);
    var user = {
      username: form.find('[name="username"]').val(),
      password: form.find('[name="password"]').val()
    };

    localStorage.setItem('user_data', JSON.stringify(user));

    $('.page-auth form').css({opacity: 0.6});

    makeRequest('/user', function (error, response, body) {
      if (error && error['code'] === 'ENOTFOUND') {
        $('.no-connection').show();
      } else if (!error && body['message'] == 'Bad credentials') {
        $('.no-connection').show();
      } else {
        localStorage.setItem('cache', JSON.stringify(body));

        $('.no-connection, .page-auth').hide();
        $('.user-avatar').attr('src', body.avatar_url);

        var fields = ['name', 'company', 'created_at',
        'login', 'blog', 'private_gists', 'public_gists',
        'public_repos', 'total_private_repos'];

        fields.forEach(function (obj) {
          $('.user-' + obj).html(body[obj]);
        });

        $('.page-info').show();
      }
    });
  });
});
