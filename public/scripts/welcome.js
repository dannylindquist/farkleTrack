var Welcome = React.createClass({
  render: function() {
    return (
      <div className="text-default row">
        <div className="col-md-6 col-xs-8 col-sm-6 col-sm-offset-3 col-xs-offset-2 col-md-offset-3 well">
          <h1 className="text-center">Scoreboard</h1>
          <GameLogin />
        </div>
      </div>
    );
  }

});

var GameLogin = React.createClass({
  getGame: function() {
    if(this.state.roomName != ''){
      document.cookie = 'roomName='+String(this.state.roomName);
      location.reload(true);
    }
  },
  getInitialState: function() {
    return {roomName: ''};
  },
  componentDidMount: function() {
    //this.checkCookies();
    // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleTextChange: function(e) {
    this.setState({roomName: e.target.value});
  },
  validationState: function(){
    var val = this.state.roomName;
    if(val.length > 0) {
      var reg = /[^A-Za-z0-9]/;
      if(reg.test(val)){
        return 'error';
      } else {
        return 'success';
      }
    }
  },
  handleClick: function(){

  },
  render: function(){
    var Input = ReactBootstrap.Input;
    return (
      <div className="form-login form-group">
        <h3><small>Enter room name:</small></h3>
        <Input
          type="text"
          value={this.state.roomName}
          placeholder="Room name"
          help="Alphanumeric characters only"
          bsStyle={this.validationState()}
          hasFeedback
          ref="input"
          groupClassName="group-class"
          labelClassName="label-class"
          onChange={this.handleTextChange} />
        <button className="btn btn-primary pull-right form-control" onClick={this.getGame}>Enter</button>
      </div>
    );
  }
});

ReactDOM.render(
  <Welcome />,
  document.getElementById('content')
);