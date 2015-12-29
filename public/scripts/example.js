var Score = React.createClass({
  render: function() {
    return (
      <p><s>{this.props.data}</s></p>
    );
  }
});

var Comment = React.createClass({
  handleClick: function(){
    this.props.setName(this.props.name);
    document.getElementById('scoreField').focus();
  },
  render: function() {
    if (this.props.history) {
      var scores = this.props.history.map(function(data){
        return (
          <Score key={data} data={data}/>
        );
      });
    } else {
      var scores = "0"
    }
    var winner = 'commentAuthor';
    var behindVal = '';
    if (this.props.max) {
      winner += ' text-success';
    } else {
      behindVal = ' (-' + (Number(this.props.maxVal) - Number(this.props.children)) + ')';
    }
    if (this.props.showHistory) {
      var displayHistory = scores;
    } else {
      var displayHistory = scores[0];
    }
    return (
      <div className="comment col-md-2 col-sm-4 col-xs-6">
        <h2 className={winner} onClick={this.handleClick}>
          {this.props.name}
        </h2>
        
        <div>
          <h2><small>{this.props.children.toString()}<sub>{behindVal}</sub></small></h2>
        </div>
        <blockquote>
          {displayHistory}
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
        this.setState({data: data, name: ''});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments, name: ''});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [], name: '', showHistory: false};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleSubmit: function(e) {
    //e.preventDefault();
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
  handleTextChange: function(input) {
    this.setState({name: input});
  },
  handleShowHistory: function(selected) {
    this.setState({showHistory: selected});
  },
  render: function() {
    return (
      <div className="commentBox">
        <form className="form-inline" onSubmit={this.handleSubmit}>
          <h1>Scores
          <small>
            <SettingsModal clearScores={this.handleSubmit} showHistory={this.state.showHistory} showHistoryChanged={this.handleShowHistory} />
          </small>
          </h1>
        </form>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} name={this.state.name} textChange={this.handleTextChange} />
        <CommentList data={this.state.data} setText={this.handleTextChange} showHistory={this.state.showHistory} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var maxVal = 0;
    this.props.data.map(function(data){
      if (maxVal < data.score) {
        maxVal = data.score;
      };
    });
    var textSet = this.props.setText;
    var showHistory = this.props.showHistory;
    var commentNodes = this.props.data.map(function(comment) {
      var setParentName = function(value){
        textSet(value);
      };
      var max = (maxVal === comment.score);
      return (
        <Comment name={comment.name} showHistory={showHistory} history={comment.history} key={comment.id} max={max} maxVal={maxVal} setName={setParentName}>
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
    return {score: '', history:[]};
  },
  handleTextChange: function(e) {
    this.setState({score: e.target.value});
  },
  handleNameChange: function(e) {
    this.props.textChange(String(e.target.value));
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var name = String(this.props.name).trim();
    var score = this.state.score.trim();
    if (!name || !score) {
      return;
    }
    this.props.onCommentSubmit({name: name, score: score});
    this.setState({score: '', history:[]});
  },
  render: function() {
    return (
      <form className="commentForm form-inline" onSubmit={this.handleSubmit}>
      <div className="form-group">
        <input
          className="form-control"
          type="text"
          placeholder="Name"
          id="nameField"
          value={this.props.name}
          onChange={this.handleNameChange}
        />
        <input
          className="form-control"
          type="number"
          placeholder="Score..."
          id="scoreField"
          value={this.state.score}
          onChange={this.handleTextChange}
        />
        <input className="btn btn-primary pull-right" type="submit" value="Update" />
      </div>
      </form>
    );
  }
});

var SettingsModal = React.createClass({
  getInitialState() {
    return { showModal: false };
  },
  close() {
    this.setState({ showModal: false });
  },
  open() {
    this.setState({ showModal: true });
  },
  handlClearScores() {
    this.props.clearScores();
  },
  handleShowHistoryChanged(e) {
    this.props.showHistoryChanged(!Boolean(this.props.showHistory));
  },
  render() {
    var Button  = ReactBootstrap.Button;
    var Modal = ReactBootstrap.Modal; 
    var Input = ReactBootstrap.Input; 

    return (
      <div className="pull-right">
        <Button
          bsStyle="primary"
          bsSize="small"
          onClick={this.open}
        >
          Settings
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Game Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Input type="checkbox" label="ShowHistory" checked={this.props.showHistory} onChange={this.handleShowHistoryChanged} />
            Clear Score: <ClearModal clearConfirmed={this.handlClearScores} />
          </Modal.Body>
          <Modal.Footer> 
            <Button onClick={this.close} bsStyle="default">Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

var ClearModal = React.createClass({
  getInitialState() {
    return { showModal: false };
  },
  close() {
    this.setState({ showModal: false });
  },
  open() {
    this.setState({ showModal: true });
  },
  confirmed() {
    this.props.clearConfirmed();
    this.setState({ showModal: false});
  },
  render() {
    var Button  = ReactBootstrap.Button;
    var Modal = ReactBootstrap.Modal;  

    return (
      <div className="">
        <Button
          bsStyle="danger"
          bsSize="small"
          onClick={this.open}
        >
          Clear
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Clear Scores?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4><small>Pressing okay will clear this game. Are you sure?</small></h4>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.confirmed} bsStyle="danger">Clear</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

ReactDOM.render(
  <CommentBox url="/api/scores" pollInterval={2000} />,
  document.getElementById('content')
);
