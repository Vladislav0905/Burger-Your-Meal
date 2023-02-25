import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { closeModal } from "../modalDelivery/modalDeliverySlice";
import { clearOrder } from "../order/orderSlice";


const initialState = {
  name: '',
  phone: '',
  format: 'devilery',
  address: '',
  floor: '',
  intercom: '',
  error: null,
  errors: {},
  touch: false,

};

export const submitForm = createAsyncThunk(
  'form/submit',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(
        'https://cloudy-slash-rubidium.glitch.me/api/order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка:${response.statusText}`);
      }

      dispatch(clearOrder());
      dispatch(closeModal());


      return await response.json();
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
)

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateFormValue: (state, action) => {
      state[action.payload.field] = action.payload.value;
    },
    setError: (state, action) => ({       //Возвращение нового state, 2-мя вариантами 
      // state.errors = action.payload;    //1 вариант 
      ...state,                      //2 
      errors: action.payload,         //вариант 
    }),
    clearError: state => {
      state.error = {};
    },
    changeTouch: state => {
      state.touch = true;

    }
  },
  extraReducers: builder => {
    builder
      .addCase(submitForm.pending, (state) => {
        state.status = 'loading';
        state.response = 'null';
        state.error = 'null';
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.status = 'success';
        state.response = action.payload;
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
  }
});

export const { updateFormValue, setError, clearError, changeTouch } =
  formSlice.actions;

export default formSlice.reducer;

export const validateForm = () => (dispatch, getState) => {
  const form = getState().form;
  const errors = {};

  if (!form.name) {
    errors.name = 'Введите имя*';

  }

  if (!form.phone) {
    errors.phone = 'Введите номер телефона*';

  }

  if (!form.address && form.format === 'delivery') {
    errors.address = 'Укажите адрес*';

  }

  if (!form.floor && form.format === 'delivery') {
    errors.floor = 'Укажите этаж*';

  }

  if (!form.intercom && form.format === 'delivery') {
    errors.intercom = 'Укажите домофон*';

  }

  if (form.format === 'picup') {
    dispatch(updateFormValue({ field: 'address', value: '' }));
    dispatch(updateFormValue({ field: 'floor', value: '' }));
    dispatch(updateFormValue({ field: 'intercom', value: '' }));
  }


  if (Object.keys.length) {
    dispatch(setError(errors));
  } else {
    dispatch(clearError(errors));
  }
}
