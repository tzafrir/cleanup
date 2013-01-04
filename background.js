var INIT_RETRY_INTERVAL = 5000;

var CLEANUP_REPEAT_INTERVAL = 10 * 60*1000;

var plus;

var initTimeoutId;
function initialize() {
  var newPlus = new GooglePlusAPI();
  if (!plus) {
    plus = newPlus;
  }
  window.clearTimeout(initTimeoutId);
  try {
    newPlus.init(function(response) {
      if (response.status) {
        plus = newPlus;
        if (localStorage['enabled'] == 'true') {
          cleanup();
        }
      } else {
        initTimeoutId = window.setTimeout(initialize, INIT_RETRY_INTERVAL);
      }
    });
  } catch (e) {
    console.error(e, e.message);
    initTimeoutId = window.setTimeout(initialize, INIT_RETRY_INTERVAL);
  }
};

initialize();

function cleanup() {
  var INTERVAL = 1000;
  function done() {
    window.setTimeout(cleanup, CLEANUP_REPEAT_INTERVAL);
  }
  function work(response) {
    if (!response.status) {
      done();
      return;
    } else if (response.data.length == 0) {
      done();
      return;
    }

    var d = Date.now();
    var startOfSearch = d - (1000 * 60 * 60 * 24 * 5); // 5 days

    for (var i = 0; i < response.data.length; ++i) {
      var post = response.data[i];
      if (post.time < startOfSearch) {
        return;
      }
      if (post.type == 'hangout' && post.data.active === false) {
        if (post.num_comments == 0) {
          // Kill it with fire
          plus.deleteActivity(function(){}, post.id);
        }
      }
    }

    window.setTimeout(function() {
      plus.lookupActivities(work, null, plus.getInfo().id, response.pageToken);
    }, INTERVAL);
  };
  plus.lookupActivities(work, null, plus.getInfo().id);
}

function onRequest(request, sender, callback) {
  if (request.type == 'enableCleanup') {
    cleanup();
    callback();
  }
}
chrome.extension.onRequest.addListener(onRequest);

if (localStorage['firstLoad'] != 'false') {
  chrome.tabs.create({url: chrome.extension.getURL('options.html')}, function() {
    localStorage['firstLoad'] = 'false';
  });
}
