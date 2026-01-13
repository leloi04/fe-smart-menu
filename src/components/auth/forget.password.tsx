import { resetPasswordAPI, sendOtpAPI, verifyOtpAPI } from '@/services/api';
import { Modal, Input, Button, message, type InputRef } from 'antd';
import { useEffect, useRef, useState } from 'react';

const Step = {
  INPUT: 1,
  OTP: 2,
  RESET: 3,
} as const;

type Step = (typeof Step)[keyof typeof Step];

const PRIMARY = '#FF6B35';

const RESEND_TIME = 60;

const ForgotPasswordModal = ({ open, onClose }: any) => {
  const [step, setStep] = useState<Step>(Step.INPUT);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const otpRefs = useRef<Array<InputRef | null>>([]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIME);
  const [otpTrigger, setOtpTrigger] = useState(0);

  useEffect(() => {
    if (step !== Step.OTP) return;

    setCountdown(RESEND_TIME);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpTrigger]);

  const resendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await sendOtpAPI(email);
      message.success('Đã gửi lại mã OTP');

      setOtp(Array(6).fill(''));
      setOtpTrigger((prev) => prev + 1);

      // focus lại ô đầu
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(Step.INPUT);
    setEmail('');
    setOtp(Array(6).fill(''));
    setPassword('');
    setConfirm('');
  };

  const close = () => {
    reset();
    onClose();
  };

  /* STEP 1 */
  const sendOtp = async () => {
    if (!email) {
      message.warning('Vui lòng nhập email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      message.warning('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await sendOtpAPI(email);
      message.success('OTP đã gửi về email');
      setStep(Step.OTP);
      setOtpTrigger((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  /* STEP 2 */
  const verifyOtp = async () => {
    if (otp.join('').length !== 6) {
      message.warning('OTP phải đủ 6 số');
      return;
    }

    setLoading(true);
    try {
      await verifyOtpAPI(email, otp.join(''));
      message.success('Xác thực thành công');
      setStep(Step.RESET);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Mã OTP không hợp lệ hoặc đã hết hạn';

      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* STEP 3 */
  const resetPassword = async () => {
    if (password.length < 6) {
      message.warning('Mật khẩu ít nhất 6 ký tự');
      return;
    }

    if (password !== confirm) {
      message.warning('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordAPI(email, password);
      message.success('Đổi mật khẩu thành công');
      close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={460}
      centered
      maskClosable={false}
    >
      <div className="px-6 py-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
          <p className="text-gray-500">
            {step === Step.INPUT && 'Nhập email của bạn để nhận mã OTP'}
            {step === Step.OTP && 'Nhập mã OTP được xác minh'}
            {step === Step.RESET && 'Tạo mật khẩu mới'}
          </p>
        </div>

        {/* STEP 1 */}
        {step === Step.INPUT && (
          <>
            <Input
              size="large"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              block
              size="large"
              loading={loading}
              style={{ background: PRIMARY, color: '#fff', marginTop: '12px' }}
              onClick={sendOtp}
            >
              Gửi mã OTP
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === Step.OTP && (
          <>
            <div className="flex justify-between gap-2">
              {otp.map((v, i) => (
                <Input
                  key={i}
                  ref={(el: any) => (otpRefs.current[i] = el)}
                  maxLength={1}
                  value={v}
                  autoFocus={i === 0}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/, '');
                    if (!val) return;

                    const clone = [...otp];
                    clone[i] = val;
                    setOtp(clone);

                    if (i < otpRefs.current.length - 1) {
                      otpRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      const clone = [...otp];

                      if (clone[i]) {
                        clone[i] = '';
                        setOtp(clone);
                      } else if (i > 0) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }
                  }}
                  className="text-center text-lg font-semibold"
                  style={{ width: 48, height: 48, borderRadius: '50%' }}
                />
              ))}
            </div>

            {/* RESEND OTP */}
            <div className="text-center text-sm mt-3">
              {countdown > 0 ? (
                <span className="text-gray-500">
                  Gửi lại mã sau <b>{countdown}s</b>
                </span>
              ) : (
                <span
                  className="text-[#FF6B35] cursor-pointer font-medium"
                  onClick={resendOtp}
                >
                  Gửi lại mã OTP
                </span>
              )}
            </div>

            <Button
              block
              size="large"
              loading={loading}
              style={{ background: PRIMARY, color: '#fff', marginTop: 12 }}
              onClick={verifyOtp}
            >
              Xác nhận
            </Button>
          </>
        )}

        {/* STEP 3 */}
        {step === Step.RESET && (
          <>
            <Input.Password
              size="large"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input.Password
              size="large"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <Button
              block
              size="large"
              loading={loading}
              style={{ background: PRIMARY, color: '#fff' }}
              onClick={resetPassword}
            >
              Reset Password
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
