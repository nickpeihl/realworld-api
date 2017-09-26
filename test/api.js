var API = require('../')
var TestCluster = require('./helper')
var parallel = require('run-parallel')

var port = 57888
var url = `http://localhost:${port}/api`

/**
 * Create an API client that points to the `localhost` server we will create in
 * the TestCluster.
*/
var client = new API({
  apiRoot: url
})

/**
 * Create a test cluster for running our `GET` unit tests in parallel. Since the
 * server sends the request back as responses, we can verify that the URL, HTTP
 * method, and headers are correct.
 */
TestCluster.test(
  'get methods',
  {
    port: port
  },
  function (cluster, t) {
    parallel(getTests, function (err, res) {
      t.error(err, 'no errors in get tests')
      Object.keys(res).forEach(function (key) {
        t.equal(res[key].body.method, 'GET', `${key} method is GET`)
        t.equal(
          res[key].body.url,
          getExpected[key].url,
          `${key} requests correct URL`
        )
        t.notOk(
          res[key].body.headers.authorization,
          `${key} no authorization in header`
        )
      })
      t.end()
    })
  }
)

/**
 * Create a test cluster for running our `POST` unit tests in parallel. Since
 * the server sends the request back as responses, we can verify that the URL,
 * HTTP method, headers, and body are correct.
 */
TestCluster.test(
  'post methods',
  {
    port: port
  },
  function (cluster, t) {
    client.setToken('beepboop')
    parallel(postTests, function (err, res) {
      t.error(err)
      Object.keys(res).forEach(function (key) {
        t.equal(res[key].body.method, 'POST', `${key} method is POST`)
        t.equal(
          res[key].body.url,
          postExpected[key].url,
          `${key} requests correct URL`
        )
        t.deepEqual(
          res[key].body.body,
          postExpected[key].body,
          `${key} returns correct body`
        )
        t.equal(
          res[key].body.headers.authorization,
          'Token beepboop',
          `${key} token submitted in header`
        )
      })
      t.end()
    })
  }
)

/**
 * Create a test cluster for running our `PUT` unit tests in parallel. Since
 * the server sends the request back as responses, we can verify that the URL,
 * HTTP method, headers, and body are correct.
 */
TestCluster.test(
  'put methods',
  {
    port: port
  },
  function (cluster, t) {
    client.setToken('blipblap')
    parallel(putTests, function (err, res) {
      t.error(err)
      Object.keys(res).forEach(function (key) {
        t.equal(res[key].body.method, 'PUT', `${key} method is PUT`)
        t.equal(
          res[key].body.url,
          putExpected[key].url,
          `${key} requests correct URL`
        )
        t.deepEqual(
          res[key].body.body,
          putExpected[key].body,
          `${key} returns correct body`
        )
        t.equal(
          res[key].body.headers.authorization,
          'Token blipblap',
          `${key} token submitted in header`
        )
      })
      t.end()
    })
  }
)

/**
 * Create a test cluster for running our `DELETE` unit tests in parallel. Since
 * the server sends the request back as responses, we can verify that the URL,
 * HTTP method, and headers are correct.
 */
TestCluster.test(
  'del methods',
  {
    port: port
  },
  function (cluster, t) {
    client.setToken('popfizzlewhiz')
    parallel(delTests, function (err, res) {
      t.error(err, 'no errors in del tests')
      Object.keys(res).forEach(function (key) {
        t.equal(res[key].body.method, 'DELETE', `${key} method is DELETE`)
        t.equal(
          res[key].body.url,
          delExpected[key].url,
          `${key} requests correct URL`
        )
        t.equal(
          res[key].body.headers.authorization,
          'Token popfizzlewhiz',
          `${key} token submitted in header`
        )
      })
      t.end()
    })
  }
)

/**
 * Each key in this object is the name of a unit test in the `getTests` object.
 * Each value includes the URL we expect the respective test to request.
*/
var getExpected = {
  'get-user': {
    url: '/api/user'
  },
  'get-profile': {
    url: '/api/profiles/foobar'
  },
  'get-article': {
    url: '/api/articles/fizzbuzz'
  },
  'get-tags': {
    url: '/api/tags'
  },
  'get-comments': {
    url: '/api/articles/foo/comments'
  },
  'article-list-all-0': {
    url: '/api/articles?limit=20&offset=0'
  },
  'article-list-all-5': {
    url: '/api/articles?limit=20&offset=100'
  },
  'article-list-tag-0': {
    url: '/api/articles?tag=bar&limit=10&offset=0'
  },
  'article-list-tag-2': {
    url: '/api/articles?tag=baz&limit=10&offset=20'
  },
  'article-list-author-0': {
    url: '/api/articles?author=biz&limit=5&offset=0'
  },
  'article-list-author-6': {
    url: '/api/articles?author=fizz&limit=5&offset=30'
  },
  'article-list-author-favs-0': {
    url: '/api/articles?favorited=fizz&limit=20&offset=0'
  },
  'article-list-author-favs-4': {
    url: '/api/articles?favorited=flam&limit=20&offset=80'
  },
  'feed-articles-0': {
    url: '/api/articles/feed?limit=10&offset=0'
  },
  'feed-articles-10': {
    url: '/api/articles/feed?limit=10&offset=100'
  }
}

/**
 * The unit tests for each `GET` method that we want to run in parallel. The
 * callback for each test includes the response from the server which is checked
 * against the matching `getExpected` result in the cluster.
*/
var getTests = {
  'get-user': function (cb) {
    client.getUser(cb)
  },
  'get-profile': function (cb) {
    client.getProfile('foobar', cb)
  },
  'get-article': function (cb) {
    client.getArticle('fizzbuzz', cb)
  },
  'get-tags': function (cb) {
    client.getTags(cb)
  },
  'get-comments': function (cb) {
    client.getComments('foo', cb)
  },
  'article-list-all-0': function (cb) {
    client.listAllArticles(cb)
  },
  'article-list-all-5': function (cb) {
    client.listAllArticles(5, cb)
  },
  'article-list-tag-0': function (cb) {
    client.listArticlesByTag('bar', cb)
  },
  'article-list-tag-2': function (cb) {
    client.listArticlesByTag('baz', 2, cb)
  },
  'article-list-author-0': function (cb) {
    client.listArticlesByAuthor('biz', cb)
  },
  'article-list-author-6': function (cb) {
    client.listArticlesByAuthor('fizz', 6, cb)
  },
  'article-list-author-favs-0': function (cb) {
    client.listArticlesByAuthorFavorites('fizz', cb)
  },
  'article-list-author-favs-4': function (cb) {
    client.listArticlesByAuthorFavorites('flam', 4, cb)
  },
  'feed-articles-0': function (cb) {
    client.feedArticles(cb)
  },
  'feed-articles-10': function (cb) {
    client.feedArticles(10, cb)
  }
}

/**
 * Each key in this object is the name of a unit test in the `postTests` object.
 * Each value includes the URL we expect the respective test to request as well
 * as the `body` we expect the POST request to contain.
 */
var postExpected = {
  'login-good': {
    url: '/api/users/login',
    body: {
      user: {
        email: 'foo@example.com',
        password: 'bar'
      }
    }
  },
  'register-good': {
    url: '/api/users',
    body: {
      user: {
        username: 'fizz',
        password: 'buzz',
        email: 'beep@boop.com'
      }
    }
  },
  'follow-user': {
    url: '/api/profiles/buzz/follow',
    body: {}
  },
  'create-article': {
    url: '/api/articles',
    body: {
      article: {
        title: 'FooBar',
        description: 'beep boop',
        body: 'Hello world',
        tagList: ['fizz', 'buzz']
      }
    }
  },
  'add-comment': {
    url: '/api/articles/foobar/comments',
    body: {
      comment: {
        body: 'bizzle bazzle'
      }
    }
  },
  'favorite-article': {
    url: '/api/articles/fizzbuzz/favorite',
    body: {}
  }
}

/**
 * The unit tests for each `POST` method that we want to run in parallel. The
 * callback for each test includes the response from the server which is checked
 * against the matching `postExpected` result in the cluster.
 */
var postTests = {
  'login-good': function (cb) {
    client.login(
      {
        email: 'foo@example.com',
        password: 'bar'
      },
      cb
    )
  },
  'register-good': function (cb) {
    client.register(
      {
        username: 'fizz',
        password: 'buzz',
        email: 'beep@boop.com'
      },
      cb
    )
  },
  'follow-user': function (cb) {
    client.followUser('buzz', cb)
  },
  'create-article': function (cb) {
    client.createArticle(
      {
        title: 'FooBar',
        description: 'beep boop',
        body: 'Hello world',
        tagList: ['fizz', 'buzz']
      },
      cb
    )
  },
  'add-comment': function (cb) {
    client.addComment(
      'foobar',
      {
        body: 'bizzle bazzle'
      },
      cb
    )
  },
  'favorite-article': function (cb) {
    client.favoriteArticle('fizzbuzz', cb)
  }
}

/**
 * Each key in this object is the name of a unit test in the `putTests` object.
 * Each value includes the URL we expect the respective test to request as well
 * as the `body` we expect the PUT request to contain.
 */
var putExpected = {
  'update-user': {
    url: '/api/user',
    body: {
      user: {
        email: 'bizz@fuzz.com',
        bio: 'Hello world',
        image: 'https://example.com/profile.jpg'
      }
    }
  },
  'update-article': {
    url: '/api/articles/fozzbazz',
    body: {
      article: {
        title: 'Fozz Bazz',
        body: 'Hola mundo'
      }
    }
  }
}

/**
 * The unit tests for each `PUT` method that we want to run in parallel. The
 * callback for each test includes the response from the server which is checked
 * against the matching `putExpected` result in the cluster.
 */
var putTests = {
  'update-user': function (cb) {
    client.updateUser(
      {
        email: 'bizz@fuzz.com',
        bio: 'Hello world',
        image: 'https://example.com/profile.jpg'
      },
      cb
    )
  },
  'update-article': function (cb) {
    client.updateArticle(
      'fozzbazz',
      {
        title: 'Fozz Bazz',
        body: 'Hola mundo'
      },
      cb
    )
  }
}

/**
 * Each key in this object is the name of a unit test in the `delTests` object.
 * Each value includes the URL we expect the respective test to request.
 */
var delExpected = {
  'unfollow-user': {
    url: '/api/profiles/FizzBuzz/follow'
  },
  'delete-article': {
    url: '/api/articles/FooBar'
  },
  'delete-comment': {
    url: '/api/articles/BeepBoop/comments/173'
  },
  'unfavorite-article': {
    url: '/api/articles/BizzBamm/favorite'
  }
}

/**
 * The unit tests for each `DELETE` method that we want to run in parallel. The
 * callback for each test includes the response from the server which is checked
 * against the matching `delExpected` result in the cluster.
 */
var delTests = {
  'unfollow-user': function (cb) {
    client.unFollowUser('FizzBuzz', cb)
  },
  'delete-article': function (cb) {
    client.deleteArticle('FooBar', cb)
  },
  'delete-comment': function (cb) {
    client.deleteComment('BeepBoop', 173, cb)
  },
  'unfavorite-article': function (cb) {
    client.unFavoriteArticle('BizzBamm', cb)
  }
}
