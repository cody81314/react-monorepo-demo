import { render } from '@testing-library/react';

import ReactMonorepoDemoDemoLib from './demo-lib';

describe('ReactMonorepoDemoDemoLib', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactMonorepoDemoDemoLib />);
    expect(baseElement).toBeTruthy();
  });
});
