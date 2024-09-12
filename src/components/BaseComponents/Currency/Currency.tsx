import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AutoNumeric from 'autonumeric';

// classes,
//   currencySymbol,
//   inputProps,
//   InputProps,
//   label,
//   placeholder,
//   value,
//   onChange,
//   required,
//   disabled,
//   helperText,
//   outputFormat,
//   preDefined
const CurrencyTextField = props => {
  const {
    classes,
    currencySymbol,
    inputProps,
    InputProps,
    label,
    placeholder,
    value,
    onChange,
    required,
    disabled,
    helperText,
    outputFormat,
    preDefined
  } = props;
  const [autonumeric, setAutonumeric] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const newAutonumeric = new AutoNumeric(inputRef.current, value, {
      ...preDefined,
      currencySymbol,
      onChange: undefined,
      onFocus: undefined,
      onBlur: undefined,
      onKeyPress: undefined,
      onKeyUp: undefined,
      onKeyDown: undefined,
      watchExternalChanges: false
    });

    setAutonumeric(newAutonumeric);

    return () => {
      newAutonumeric.remove();
    };
  }, [value, currencySymbol, preDefined]);

  useEffect(() => {
    if (!autonumeric) return;

    const isValueChanged =
      value !== autonumeric.getNumericString() && autonumeric.getNumber() !== value;

    if (isValueChanged) {
      autonumeric.set(value);
    }
  }, [autonumeric, value]);

  const getValue = () => {
    if (!autonumeric) return;
    const valueMapper = {
      string: numeric => numeric.getNumericString(),
      number: numeric => numeric.getNumber()
    };
    return valueMapper[outputFormat](autonumeric);
  };

  // const callEventHandler = (event, eventName) => {
  //   // if (!eventName) return;
  //   // eventName(event, getValue());
  //   switch (eventName) {
  //     case 'onFocus':
  //       if (event.target.value.length === 0) {
  //         setDefaultPlaceholder('0');

  //       }
  //       break;
  //     // case 'onKeyDown':
  //     //   if (event.target.value.length > 0) {
  //     //     setVal(event.target.value);
  //     //   }
  const callEventHandler = (event, eventName) => {
    if (!props[eventName]) return;
    props[eventName](event, getValue());
  };

  return (
    <>
      <div className='govuk-form-group'>
        <div className='govuk-label-wrapper'>
          <label className='govuk-label' htmlFor='cost'>
            {label}
          </label>
        </div>
        <div className='govuk-input__wrapper'>
          <div className='govuk-input__prefix' aria-hidden='true'>
            {currencySymbol}
          </div>
          <input
            inputRef={inputRef}
            className='govuk-input govuk-input--width'
            id='cost'
            name='cost'
            type='text'
            spellCheck='false'
            placeholder={placeholder}
            onChange={e => callEventHandler(e, 'onChange')}
            onFocus={e => callEventHandler(e, 'onFocus')}
            onBlur={e => callEventHandler(e, 'onBlur')}
            onKeyUp={e => callEventHandler(e, 'onKeyUp')}
            onKeyDown={e => callEventHandler(e, 'onKeyDown')}
            value={helperText}
            required={required}
            disabled={disabled}
            {...inputProps}
            {...InputProps}
          />
        </div>
      </div>
    </>
  );
};

CurrencyTextField.propTypes = {
  type: PropTypes.oneOf(['text', 'tel', 'hidden']),
  variant: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  textAlign: PropTypes.oneOf(['right', 'left', 'center']),
  tabIndex: PropTypes.number,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  currencySymbol: PropTypes.string,
  decimalCharacter: PropTypes.string,
  decimalCharacterAlternative: PropTypes.string,
  decimalPlaces: PropTypes.number,
  decimalPlacesShownOnBlur: PropTypes.number,
  decimalPlacesShownOnFocus: PropTypes.number,
  digitGroupSeparator: PropTypes.string,
  leadingZero: PropTypes.oneOf(['allow', 'deny', 'keep']),
  maximumValue: PropTypes.string,
  minimumValue: PropTypes.string,
  negativePositiveSignPlacement: PropTypes.oneOf(['l', 'r', 'p', 's']),
  negativeSignCharacter: PropTypes.string,
  outputFormat: PropTypes.oneOf(['string', 'number']),
  selectOnFocus: PropTypes.bool,
  positiveSignCharacter: PropTypes.string,
  readOnly: PropTypes.bool,
  preDefined: PropTypes.object,
  helperText: PropTypes.any,
  required: PropTypes.any
};

CurrencyTextField.defaultProps = {
  type: 'text',
  variant: 'standard',
  currencySymbol: '£',
  outputFormat: 'number',
  textAlign: 'right',
  maximumValue: '10000000000000',
  minimumValue: '-10000000000000'
};

export default CurrencyTextField;
export const predefinedOptions = AutoNumeric.getPredefinedOptions();
