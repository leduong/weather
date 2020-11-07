import * as moment from 'moment';
import { useEffect, useState } from 'react';
import { of, Subject } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import './App.scss';

function App() {
  const [onChangeCity$] = useState(() => new Subject());
  const [onChangeForecast$] = useState(() => new Subject());
  const [cities, setCities] = useState([]);
  const [forecasts, setForecasts] = useState([]);

  const searchByCityName = key =>
    fromFetch(`/api/location/search/?query=${key}`).pipe(
      switchMap(response => {
        if (response.ok) {
          return response.json();
        }
        return of({ error: true, message: `Error ${response.status}` });
      }),
      catchError(error => of({ error: true, message: error.message })),
    );

  const getForeCastByWoeId = woeid =>
    fromFetch(`/api/location/${woeid}/`).pipe(
      switchMap(response => {
        if (response.ok) {
          return response.json();
        }
        return of({ error: true, message: `Error ${response.status}` });
      }),
      catchError(error => of({ error: true, message: error.message })),
    );

  useEffect(() => {
    const daysForecast$ = onChangeForecast$.subscribe(key => {
      getForeCastByWoeId(key).subscribe(results => {
        const forecast = {
          woeid: results.woeid,
          days:
            results.consolidated_weather?.length > 5
              ? results.consolidated_weather.slice(0, 5)
              : results.consolidated_weather,
        };
        setForecasts(current => [...current, forecast]);
      });
    });

    const cities$ = onChangeCity$.pipe(debounceTime(1000)).subscribe(key => {
      searchByCityName(key).subscribe(results => {
        setCities(results);

        // Reset forecasts
        setForecasts([]);
        results.map(x => onChangeForecast$.next(x.woeid));
      });
    });
    return () => {
      cities$.unsubscribe();
      daysForecast$.unsubscribe();
    };
  }, []);

  const onChangeKeyword = value => {
    onChangeCity$.next(value);
  };

  const dayOfWeek = date => moment(date).format('dddd');
  const isTemperature = temp => (Number(temp) > 10 ? temp.toFixed() : `0${temp.toFixed()}`);

  const showDaysForecast = woeid => {
    const daysByWoeId = forecasts.filter(x => x.woeid === woeid)[0];
    return !daysByWoeId ? (
      <></>
    ) : (
      daysByWoeId.days.map((x, idx) => {
        return (
          <div className="col" key={idx}>
            <div className="card">
              <div className="card-body">
                <div className="justify-content-center">
                  <div className="w-100 p-3">{dayOfWeek(x.applicable_date)}</div>
                  <div className="w-100">Min:{isTemperature(x.min_temp)}</div>
                  <div className="w-100">Max:{isTemperature(x.max_temp)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })
    );
  };

  return (
    <div className="container-fluid">
      <h3>MetaWeather Search</h3>

      <div className="form-group has-search">
        <span className="fa fa-search form-control-feedback"></span>
        <input
          type="text"
          className="form-control"
          placeholder="Press name of the city..."
          onChange={e => {
            onChangeKeyword(e.target.value);
          }}
        />
      </div>

      {!cities.length ? (
        <></>
      ) : (
        cities.map((c, idx) => {
          return (
            <div className="card mb-1" key={idx}>
              <div className="card-header">{c.title}</div>
              <div className="card-body">
                <div className="row">{showDaysForecast(c.woeid)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default App;
