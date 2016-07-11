var React = require('react'),
    ReactDOM = require('react-dom'),
    remark = require('remark'),
    reactRenderer = require('remark-react');

var App = React.createClass({
    getInitialState() {
        return { text: '# hello world' };
    },
    onChange(e) {
        this.setState({ text: e.target.value });
    },
    render() {
        return (<div>
            <textarea
                value={this.state.text}
                onChange={this.onChange} />
            <div id='preview'>
                {remark().use(reactRenderer).process(this.state.text).contents}
            </div>
        </div>);
    }
});

ReactDOM.render(<App />, document.getElementById('app'));
