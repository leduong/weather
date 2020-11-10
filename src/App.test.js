import { render, screen } from '@testing-library/react';

import App from './App';

test('renders MetaWeather Search', () => {
  render(<App />);
  const linkElement = screen.getByText(/MetaWeather Search/i);
  expect(linkElement).toBeInTheDocument();
});
