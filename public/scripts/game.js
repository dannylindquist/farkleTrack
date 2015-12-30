var Score = React.createClass({
  render: function() {
    return (
      <p><s>{this.props.data}</s></p>
    );
  }
});

var Player = React.createClass({
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
    var winner = 'playerName';
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
      <div className="player col-md-2 col-sm-4 col-xs-6">
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

var GameBox = React.createClass({
  loadPlayersFromServer: function() {
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
  handleScoreSubmit: function(player) {
    var players = this.state.data;
    
    player.id = Date.now();
    var newComments = players.concat([player]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: player,
      success: function(data) {
        this.setState({data: data, name: ''});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: players, name: ''});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [], name: '', showHistory: false};
  },
  componentDidMount: function() {
    this.loadPlayersFromServer();
    setInterval(this.loadPlayersFromServer, this.props.pollInterval);
  },
  handleSubmit: function(e) {
    //e.preventDefault();
    var players = this.state.data;
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
        this.setState({data: players});
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
      <div className="GameBox">
        <form className="form-inline" onSubmit={this.handleSubmit}>
          <h1>Scores
          <small>
            <SettingsModal clearScores={this.handleSubmit} showHistory={this.state.showHistory} showHistoryChanged={this.handleShowHistory} />
          </small>
          </h1>
        </form>
        <ScoreForm onCommentSubmit={this.handleScoreSubmit} name={this.state.name} textChange={this.handleTextChange} />
        <PlayerList data={this.state.data} setText={this.handleTextChange} showHistory={this.state.showHistory} />
      </div>
    );
  }
});

var PlayerList = React.createClass({
  render: function() {
    var maxVal = 0;
    this.props.data.map(function(data){
      if (maxVal < data.score) {
        maxVal = data.score;
      };
    });
    var textSet = this.props.setText;
    var showHistory = this.props.showHistory;
    var playerNodes = this.props.data.map(function(player) {
      var setParentName = function(value){
        textSet(value);
      };
      var max = (maxVal === player.score);
      return (
        <Player name={player.name} showHistory={showHistory} history={player.history} key={player.id} max={max} maxVal={maxVal} setName={setParentName}>
          {player.score}
        </Player>
      );
    });
    return (
      <div className="playerList row">
        {playerNodes}
      </div>
    );
  }
});

var ScoreForm = React.createClass({
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
      <form className="ScoreForm form-inline" onSubmit={this.handleSubmit}>
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
          type="text"
          pattern="\d*"
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
  handleChangeRoom() {
    document.cookie = 'roomName=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    location.reload(true);
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
            <Button onClick={this.handleChangeRoom} bsStyle="default">Change Room</Button>
            <ClearModal clearConfirmed={this.handlClearScores} />
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
  <GameBox url="/api/scores" pollInterval={2000} />,
  document.getElementById('content')
);
