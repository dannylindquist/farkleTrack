var Welcome = React.createClass({
	render: function() {
		return (
			<div className="text-default">
				<h1>Play Farkle</h1>
			</div>
			//<Games url={this.props.url} />
		);
	}

});

var Games = React.createClass({
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
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function(){
  	return (
      <div className="commentBox">
        <p>Hello</p>
      </div>
    );
  }
});

ReactDOM.render(
  <Welcome url="/api/games" pollInterval={2000} />,
  document.getElementById('content')
);