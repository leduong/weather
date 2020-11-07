import './App.scss';

function App() {
  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">MetaWeather Search</h5>
          <input />
        </div>
        <div className="card-body">
          <div className="form-group has-search">
            <span className="fa fa-search form-control-feedback"></span>
            <input type="text" className="form-control" placeholder="Search" />{' '}
          </div>
        </div>
        <div className="card-body">This is some text within a card body.</div>
      </div>
    </div>
  );
}

export default App;
