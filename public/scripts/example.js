var Score = React.createClass({
  render: function() {
    return (
      <p><s>{this.props.data}</s></p>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    if (this.props.history) {
      var scores = this.props.history.reverse().map(function(data){
        return (
          <Score key={data} data={data}/>
        );
      });
    } else {
      var scores = "0"
    }
    

    return (
      <div className="comment col-md-2 col-sm-2 col-xs-6">
        <h2 className="commentAuthor">
          {this.props.name}
        </h2>
        <div>
          <h2><small>{this.props.children.toString()}</small></h2>
        </div>
        <blockquote>
          {scores}
        </blockquote>
      </div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.setState({data: []});
    $.ajax({
      url: '/api/clear',
      dataType: 'json',
      type: 'POST',
      data: [],
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="commentBox">
        <form className="form-inline" onSubmit={this.handleSubmit}>
          <h1>Scores
          <small>
            <button className="pull-right btn btn-small btn-danger" type="submit">Clear</button>
          </small>
          </h1>
        </form>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        <CommentList data={this.state.data} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment name={comment.name} history={comment.history} key={comment.id}>
          {comment.score}
        </Comment>
      );
    });
    return (
      <div className="commentList row">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {name: '', score: 0, history:[]};
  },
  handleAuthorChange: function(e) {
    this.setState({name: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({score: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.state.name.trim();
    var score = this.state.score.trim();
    if (!name || !score) {
      return;
    }
    this.props.onCommentSubmit({name: name, score: score});
    this.setState({name: '', score: 0, history:[]});
  },
  render: function() {
    return (
      <form className="commentForm form-inline" onSubmit={this.handleSubmit}>
      <div className="form-group">
        <input
          className="form-control"
          type="text"
          placeholder="Name"
          value={this.state.name}
          onChange={this.handleAuthorChange}
        />
        <input
          className="form-control"
          type="number"
          placeholder="Score..."
          value={this.state.score}
          onChange={this.handleTextChange}
        />
        <input className="btn btn-primary" type="submit" value="Update" />
      </div>
      </form>
    );
  }
});

ReactDOM.render(
  <CommentBox url="/api/scores" pollInterval={2000} />,
  document.getElementById('content')
);
