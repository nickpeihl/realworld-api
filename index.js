var request = require('nets')
var xtend = require('xtend')

module.exports.base = 'https://conduit.productionready.io/api'

module.exports = RealWorld

/**
 * Realworld library for open API calls using JavaScript
 * @param {Object} [opts] options for configuring API
 * @param {string} [opts.token=null] authentication token from RealWorld
 * @param {string} [opts.apiRoot=https://conduit.productionready.io/api] the url
 * to Realworld API
 * @example
 * var client = new RealWorld()
 * @example
 * var client = new RealWorld({
 *   apiRoot: 'http://localhost:8000/api',
 *   token: 'my-secret-authentication-token'
 * })
 * @see [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api#realworld-api-spec)
 */
function RealWorld (opts) {
  if (!(this instanceof RealWorld)) return new RealWorld(opts)
  if (!opts) opts = {}
  this.token = opts.token || null
  this.apiRoot = opts.apiRoot || 'https://conduit.productionready.io/api'
}

var defaults = {
  json: true
}

var limit = function (count, p) {
  return `limit=${count}&offset=${p ? p * count : 0}`
}

RealWorld.prototype._useToken = function () {
  if (this.token) {
    return xtend(defaults, {
      headers: {
        Authorization: `Token ${this.token}`
      }
    })
  }
}

var encode = encodeURIComponent

RealWorld.prototype._getRequest = function (url, cb) {
  request(
    xtend(defaults, this._useToken(), {
      method: 'GET',
      url: `${this.apiRoot}${url}`
    }),
    cb
  )
}

RealWorld.prototype._postRequest = function (url, body, cb) {
  request(
    xtend(defaults, this._useToken(), {
      method: 'POST',
      url: `${this.apiRoot}${url}`,
      body: body
    }),
    cb
  )
}

RealWorld.prototype._putRequest = function (url, body, cb) {
  request(
    xtend(defaults, this._useToken(), {
      method: 'PUT',
      url: `${this.apiRoot}${url}`,
      body: body
    }),
    cb
  )
}

RealWorld.prototype._delRequest = function (url, cb) {
  request(
    xtend(defaults, this._useToken(), {
      method: 'DELETE',
      url: `${this.apiRoot}${url}`
    }),
    cb
  )
}

/**
 * Log in to the RealWorld API
 * If successful, the `data` result will be type {User}
 * @param {Object} opts
 * @param {string} opts.email email address of user
 * @param {string} opts.password password of user
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.login(
 *   {
 *     email: 'mike@example.com',
 *     password: 'secret'
 *   },
 *   handleResponse
 * )
*/

RealWorld.prototype.login = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (opts.email && opts.password) {
    this._postRequest(
      `/users/login`,
      {
        user: {
          email: opts.email,
          password: opts.password
        }
      },
      cb
    )
  } else {
    cb(new Error('Must supply username and password'))
  }
}

/**
 * Register a new user with the RealWorld API
 * @param {Object} opts
 * @param {string} opts.username username of registering user
 * @param {string} opts.email email address of registering user
 * @param {string} opts.password password of registering user
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.register(
 *   {
 *     email: 'rick@example.com',
 *     password: 'shhhh',
 *     username: 'rick'
 *   },
 *   handleResponse
 * )
*/
RealWorld.prototype.register = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (opts.username && opts.email && opts.password) {
    this._postRequest(
      `/users`,
      {
        user: {
          username: opts.username,
          email: opts.email,
          password: opts.password
        }
      },
      cb
    )
  } else {
    cb(new Error('Must supply a username, email, and password'))
  }
}

/**
 * Get the logged in user
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.getUser(handleResponse)
 */
RealWorld.prototype.getUser = function (cb) {
  this._getRequest(`/user`, cb)
}

/**
 * Update the logged in user info
 * @param {Object} opts
 * @param {string} [opts.email=null] email address of user
 * @param {string} [opts.username=null] username of user
 * @param {string} [opts.bio=null] biography of user
 * @param {string} [opts.password=null] password of user
 * @param {string} [opts.image=null] url of user image
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.updateUser(
 *   {
 *     email: 'stacy@example.com',
 *     password: 'hush',
 *     username: 'stace',
 *     bio: 'riot grrl'
 *   },
 *   handleResponse
 * )
*/
RealWorld.prototype.updateUser = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  this._putRequest(
    `/user`,
    {
      user: opts
    },
    cb
  )
}

/**
 * Get profile of a user
 * @param {string} username username of profile to retrieve
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.getProfile('rick', handleResponse)
 */
RealWorld.prototype.getProfile = function (username, cb) {
  this._getRequest(`/profiles/${username}`, cb)
}

/**
 * Follow a user (authentication required)
 * @param {string} username username to follow
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.followUser('rick', handleResponse)
 */
RealWorld.prototype.followUser = function (username, cb) {
  this._postRequest(`/profiles/${username}/follow`, {}, cb)
}

/**
 * Unfollow a user (authentication required)
 * @param {string} username username to unfollow
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.unFollowUser('rick', handleResponse)
 */
RealWorld.prototype.unFollowUser = function (username, cb) {
  this._delRequest(`/profiles/${username}/follow`, cb)
}

/**
 * Request a list of 20 articles sorted by most recent in descending order
 * @param {Number} [page=0] page specify which page of articles to show
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.listAllArticles(handleResponse)
 * @example
 * client.listAllArticles(2, handleResponse)
 */
RealWorld.prototype.listAllArticles = function (page, cb) {
  if (typeof page === 'function') {
    cb = page
    page = null
  }
  this._getRequest(`/articles?${limit(20, page)}`, cb)
}

/**
 * Request a list of 10 articles filtered by a tag and sorted by most recent
 * in descending order
 * @param {string} tag tag name to filter by
 * @param {Number} [page=0] specify which page of articles to show
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.listArticlesByTag('JavaScript', handleResponse)
 * @example
 * client.listArticlesByTag('JavaScript', 2, handleResponse)
 */
RealWorld.prototype.listArticlesByTag = function (tag, page, cb) {
  if (typeof page === 'function') {
    cb = page
    page = null
  }
  this._getRequest(`/articles?tag=${encode(tag)}&${limit(10, page)}`, cb)
}

/**
 * Request a list of five articles filtered by author and sorted by most recent
 * in descending order
 * @param {string} author username of author to filter by
 * @param {Number} [page=0] specify which page of articles to show
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.listArticlesByAuthor('rick', handleResponse)
 * @example
 * client.listArticlesByAuthor('rick', 2, handleResponse)
 */
RealWorld.prototype.listArticlesByAuthor = function (author, page, cb) {
  if (typeof page === 'function') {
    cb = page
    page = null
  }
  this._getRequest(`/articles?author=${encode(author)}&${limit(5, page)}`, cb)
}

/**
 * Request a list of 20 articles filtered by author favorites and sorted by most
 * recent in descending order
 * @param {string} author username of author to filter favorite articles by
 * @param {Number} [page=0] specify which page of articles to show
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.listArticlesByAuthorFavorites('rick', handleResponse)
 * @example
 * client.listArticlesByAuthorFavorites('rick', 1, handleResponse)
 */
RealWorld.prototype.listArticlesByAuthorFavorites = function (author, page, cb) {
  if (typeof page === 'function') {
    cb = page
    page = null
  }
  this._getRequest(
    `/articles?favorited=${encode(author)}&${limit(20, page)}`,
    cb
  )
}

/**
 * Request a list of ten articles from the currently logged in users feed sorted
 * by most recent in descending order (authentication required)
 * @param {Number} [page=0] specify which page of articles to show
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.feedArticles(handleResponse)
 * @example
 * client.feedArticles(2, handleResponse)
 */
RealWorld.prototype.feedArticles = function (page, cb) {
  if (typeof page === 'function') {
    cb = page
    page = null
  }
  this._getRequest(`/articles/feed?${limit(10, page)}`, cb)
}

/**
 * Request contents from a single article with the specified slug
 * @param {string} slug shortname (slug) of article
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.getArticle('angular-app-dev-e33mn9', handleResponse)
 */
RealWorld.prototype.getArticle = function (slug, cb) {
  this._getRequest(`/articles/${slug}`, cb)
}

/**
 * Create a new article (authentication required)
 * @param {Object} opts
 * @param {string} opts.title title of article
 * @param {string} opts.description short description of article
 * @param {string} opts.body content of article
 * @param {[string]} [opts.tagList=null] array of tags to add to article
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.createArticle(
 *   {
 *     title: 'My awesome article',
 *     description: 'beep boop',
 *     body: 'wham bam thank you ma\'am',
 *     tagList: ['awesomeness', 'robots']
 *   },
 *   handleResponse
 * )
*/
RealWorld.prototype.createArticle = function (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  this._postRequest(
    `/articles`,
    {
      article: opts
    },
    cb
  )
}

/**
 * Update an existing article with given slug and options (authentication
 * required)
 * @param {string} slug shortname (slug) of article to update
 * @param {Object} opts
 * @param {string} [opts.title=null] title of article
 * @param {string} [opts.description=null] short description of article
 * @param {string} [opts.body=null] content of article
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.updateArticle('my-awesome-article-ew9439', {
 *   title: 'my awesome gender neutral article',
 *   description: 'boop beep',
 *   body: 'wham bam thank you friend'
 * })
*/
RealWorld.prototype.updateArticle = function (slug, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  this._putRequest(
    `/articles/${slug}`,
    {
      article: opts
    },
    cb
  )
}

/**
 * Delete an existing article with the given slug (authentication required)
 * @param {string} slug shortname (slug) of article to delete
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.deleteArticle('my-awesome-article-ew9439', handleResponse)
 */
RealWorld.prototype.deleteArticle = function (slug, cb) {
  this._delRequest(`/articles/${slug}`, cb)
}

/**
 * Add a comment to an article with the given slug (authentication required)
 * @param {string} slug shortname (slug) of article to add comment to
 * @param {Object} opts
 * @param {string} opts.body content of comment
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.addComment(
 *   'my-awesome-article-ew9439',
 *   {
 *     body: 'this is a good article'
 *   },
 *   handleResponse
 * )
*/
RealWorld.prototype.addComment = function (slug, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  this._postRequest(
    `/articles/${slug}/comments`,
    {
      comment: opts
    },
    cb
  )
}

/**
 * Get comments from an article
 * @param {string} slug shortname (slug) of article from which to retrieve
 * comments
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.getComments('angular-app-dev-e33mn9', handleResponse)
 */
RealWorld.prototype.getComments = function (slug, cb) {
  this._getRequest(`/articles/${slug}/comments`, cb)
}

/**
 * Delete comment from an article (authentication required)
 * @param {string} slug shortname (slug) of article
 * @param {string} commentId unique id of comment to delete
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.deleteComment('angular-app-dev-e33mn9', 'e11dfeg', handleResponse)
 */
RealWorld.prototype.deleteComment = function (slug, commentId, cb) {
  this._delRequest(`/articles/${slug}/comments/${commentId}`, cb)
}

/**
 * Favorite an article (authentication required)
 * @param {string} slug shortname (slug) of article to favorite
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.favoriteArticle('my-awesome-article-ew9439', handleResponse)
 */
RealWorld.prototype.favoriteArticle = function (slug, cb) {
  this._postRequest(`/articles/${slug}/favorite`, {}, cb)
}

/**
 * Unfavorite an article (authentication required)
 * @param {string} slug shortname (slug) of article to unfavorite
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.unFavoriteArticle('my-awesome-article-ew9439', handleResponse)
 */
RealWorld.prototype.unFavoriteArticle = function (slug, cb) {
  this._delRequest(`/articles/${slug}/favorite`, cb)
}

/**
 * Get a list of tags
 * @param {RealWorld~requestCallback} cb Callback function
 * @example
 * client.getTags(handleResponse)
 */
RealWorld.prototype.getTags = function (cb) {
  this._getRequest(`/tags`, cb)
}

/**
 * Set the authentication token
 * @param {string} _token authentication token to set
 * @example
 * client.setToken('my-secret-authentication-token')
 */
RealWorld.prototype.setToken = function (_token) {
  this.token = _token
}

/**
 * This callback is displayed as part of the RealWorld class. The error should
 * be null if the method was able to run. HTTP and API errors are not caught as
 * errors so that you can catch them yourself. For example, a response code 500
 * may return `(null, { res.statusCode: 500, res.statusMessage: 'Internal Server Error' }, null)`.
 *
 * API errors are returned with a 422 status code. Errors are included as JSON
 * in the `data` result and are in the form of
 *
 * `{
 *  "errors":{
 *    "body": [
 *      "can't be empty"
 *    ]
 *  }
 * }`
 *
 * where `body` may be any parameter such as `password`, `email`, etc.
 *
 * Successful API requests will return JSON data as seen in the
 * {@link https://github.com/gothinkster/realworld/tree/master/api#realworld-api-spec RealWorld API Spec}
 * @callback RealWorld~requestCallback
 * @param {Error} err error if method was unable to run
 * @param {Object} res response object from server
 * @param {Object} data data result from the server as JSON
 * @example
 * function handleResponse (err, res, data) {
 *   if (err) return console.error(err)
 *   if (res.statusCode === 422 && data.errors) {
 *     Object.keys(data.errors).forEach(function (err) {
 *       var values = data.errors[err]
 *       values.forEach(function (v) {
 *         console.error(`${err} ${v}`)
 *       })
 *     })
 *     return
 *   }
 *   if (res.statusCode !== 200) {
 *     return console.log(`${res.statusCode}: ${res.statusMessage}`)
 *   }
 *   return console.log(data)
 * }
 *
*/
