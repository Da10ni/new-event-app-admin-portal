import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      style: {
        background: '#ECFDF5',
        color: '#047857',
        border: '1px solid #A7F3D0',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: '#ECFDF5',
      },
    }),

  error: (message: string) =>
    toast.error(message, {
      style: {
        background: '#FEF2F2',
        color: '#B91C1C',
        border: '1px solid #FECACA',
      },
      iconTheme: {
        primary: '#C13515',
        secondary: '#FEF2F2',
      },
    }),

  info: (message: string) =>
    toast(message, {
      icon: '\u2139\uFE0F',
      style: {
        background: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #BFDBFE',
      },
    }),

  warning: (message: string) =>
    toast(message, {
      icon: '\u26A0\uFE0F',
      style: {
        background: '#FFFBEB',
        color: '#B45309',
        border: '1px solid #FDE68A',
      },
    }),

  loading: (message: string) => toast.loading(message),

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
