import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useState, useRef } from 'react';
import MainCard from '../Components/MainCard';

// project imports

// ==============================|| STYLED COMPONENTS ||============================== //

const ColorButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .2)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  '&:hover': {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  },
}));

const StyledMainCard = styled(MainCard)(({ theme }) => ({
  borderRadius: 16,
  borderLeft: `6px solid ${alpha(theme.palette.primary.main, 0.7)}`,
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

const NavigationButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: '8px 24px',
  fontWeight: 600,
  textTransform: 'none',
}));

// ==============================|| PATIENT ONBOARDING JOURNEY ||============================== //

const PatientSurvey = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [capturedImages, setCapturedImages] = useState({
    'Front View': null,
    'Side View (Left)': null,
    'Side View (Right)': null
  });
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentCaptureLabel, setCurrentCaptureLabel] = useState('');
  const totalSteps = 5; // Includes the final "What Happens Next" step

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event, label) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImages(prev => ({
          ...prev,
          [label]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCamera = (label) => {
    setCurrentCaptureLabel(label);
    setShowCamera(true);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
        });
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImages(prev => ({
        ...prev,
        [currentCaptureLabel]: imageDataUrl
      }));
      
      // Stop camera
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setShowCamera(false);
    }
  };

  const handleCancelCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  return (
    <Grid container spacing={3} sx={{ background: '#fafafa' }}>
      <Grid xs={12}>
        <Stack sx={{ gap: 3 }}>
          <StyledMainCard 
            title="Patient Onboarding Journey"
            sx={{ background: 'linear-gradient(to right, #ffffff, #f8f5ff)' }}
          >
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                From Skin Concerns to Personalized Care
              </Typography>
              <Typography variant="body1" sx={{ color: '#555' }}>
                At Medskls Apothecary, our mission is to give you skincare that actually works—customized for your unique skin and your real-life routine. This journey begins with understanding you. Here's how we guide you through a smooth, thoughtful registration process that leads to the right treatment, the right product, and results you can trust.
              </Typography>
            </Stack>
          </StyledMainCard>

          {currentStep === 1 && (
            <StyledMainCard 
              title={
                <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                  Step 1: Let's Get to Know You
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                Before we talk about products or treatments, we start with your story. We ask for basic personal info to keep your account secure and allow our experts to follow up, if needed.
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <StyledTextField fullWidth size="small" label="Full Name" variant="outlined" />
                <StyledTextField fullWidth size="small" type="date" label="Date of Birth" variant="outlined" InputLabelProps={{ shrink: true }} />
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Gender"
                  variant="outlined"
                >
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                </StyledTextField>
                <StyledTextField fullWidth size="small" label="Phone Number" variant="outlined" />
                <StyledTextField fullWidth size="small" type="email" label="Email Address" variant="outlined" />
                <StyledTextField fullWidth size="small" label="Residential Address" variant="outlined" />
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 2 && (
            <StyledMainCard 
              title={
                <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                  Step 2: Tell Us About Your Skin
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                What you're experiencing matters deeply to us. The more we understand your skin's journey, the better we can support it.
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#6a1b9a', fontWeight: 500 }}>
                  Primary Skin Concern (Choose one or more)
                </Typography>
                <Grid container spacing={1}>
                  {['Acne', 'Blackheads', 'Melasma', 'Hyperpigmentation', 'Rosacea', 'Skin-Ageing', 'Menopausal Skin'].map((concern) => (
                    <Grid item xs={12} sm={6} key={concern}>
                      <FormControlLabel 
                        control={<StyledCheckbox size="small" />} 
                        label={<Typography variant="body2" sx={{ color: '#555' }}>{concern}</Typography>} 
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="How long have you had this concern?"
                  variant="outlined"
                >
                  <MenuItem value="less-than-3">Less than 3 months</MenuItem>
                  <MenuItem value="3-12">3–12 months</MenuItem>
                  <MenuItem value="over-1">Over a year</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Have you tried any treatments before?"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes (please specify)</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Do you have any known skin allergies?"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes (please list)</MenuItem>
                  <MenuItem value="no">No / Not sure</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Are you currently taking any medications?"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes (please list)</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Pregnant or breastfeeding?"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </StyledTextField>
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 3 && (
            <StyledMainCard 
              title={
                <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                  Step 3: Your Lifestyle + Habits
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                Your daily life plays a major role in your skin's health. This part helps us understand what your skin goes through every day.
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Skin type?"
                  variant="outlined"
                >
                  <MenuItem value="oily">Oily</MenuItem>
                  <MenuItem value="dry">Dry</MenuItem>
                  <MenuItem value="combination">Combination</MenuItem>
                  <MenuItem value="sensitive">Sensitive</MenuItem>
                  <MenuItem value="not-sure">Not sure</MenuItem>
                </StyledTextField>
                
                <Typography variant="subtitle1" sx={{ color: '#6a1b9a', fontWeight: 500 }}>
                  Current skincare routine:
                </Typography>
                <Grid container spacing={1}>
                  {['Cleanser', 'Moisturizer', 'Sunscreen'].map((item) => (
                    <Grid item xs={12} sm={6} key={item}>
                      <FormControlLabel 
                        control={<StyledCheckbox size="small" />} 
                        label={<Typography variant="body2" sx={{ color: '#555' }}>{item}</Typography>} 
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Any actives (retinol, acids, etc.)"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="not-sure">Not sure</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Sun exposure frequency"
                  variant="outlined"
                >
                  <MenuItem value="rarely">Rarely</MenuItem>
                  <MenuItem value="daily-spf">Daily (with SPF)</MenuItem>
                  <MenuItem value="daily-no-spf">Daily (no SPF)</MenuItem>
                  <MenuItem value="outdoors-often">Outdoors often</MenuItem>
                </StyledTextField>
                
                <StyledTextField
                  fullWidth
                  size="small"
                  select
                  label="Dietary restrictions?"
                  variant="outlined"
                >
                  <MenuItem value="yes">Yes (please specify)</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </StyledTextField>
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 4 && (
            <StyledMainCard 
              title={
                <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                  Step 4: Ready for Your Treatment Plan
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                Once we understand your skin, health, and lifestyle, it's time to begin your personalized plan.
              </Typography>
              
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#6a1b9a', fontWeight: 500 }}>
                  Upload clear photos of your face:
                </Typography>
                
                {showCamera ? (
                  <Stack spacing={2}>
                    <Typography variant="body2" sx={{ color: '#6a1b9a' }}>
                      Capturing: {currentCaptureLabel}
                    </Typography>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      style={{ width: '100%', borderRadius: '12px' }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        onClick={handleCapturePhoto}
                        sx={{
                          backgroundColor: '#6a1b9a',
                          '&:hover': { backgroundColor: '#7b1fa2' }
                        }}
                      >
                        Capture Photo
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCancelCamera}
                        sx={{
                          color: '#6a1b9a',
                          borderColor: '#6a1b9a',
                          '&:hover': { borderColor: '#6a1b9a' }
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    {['Front View', 'Side View (Left)', 'Side View (Right)'].map((label) => (
                      <Stack key={label} spacing={1}>
                        {capturedImages[label] && (
                          <img 
                            src={capturedImages[label]} 
                            alt={`Captured ${label}`} 
                            style={{ 
                              width: '100%', 
                              maxHeight: '200px', 
                              objectFit: 'contain',
                              borderRadius: '12px',
                              border: `1px solid ${alpha('#6a1b9a', 0.3)}`
                            }} 
                          />
                        )}
                        <Stack direction="row" spacing={2}>
                          <Button 
                            fullWidth 
                            size="small" 
                            variant="outlined" 
                            component="label"
                            sx={{
                              borderColor: alpha('#6a1b9a', 0.3),
                              color: '#6a1b9a',
                              '&:hover': {
                                borderColor: '#6a1b9a',
                                backgroundColor: alpha('#6a1b9a', 0.04)
                              }
                            }}
                          >
                            Upload {label}
                            <input 
                              type="file" 
                              accept="image/*" 
                              hidden 
                              onChange={(e) => handleFileUpload(e, label)}
                            />
                          </Button>
                          <Button 
                            fullWidth 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleStartCamera(label)}
                            sx={{
                              borderColor: alpha('#6a1b9a', 0.3),
                              color: '#6a1b9a',
                              '&:hover': {
                                borderColor: '#6a1b9a',
                                backgroundColor: alpha('#6a1b9a', 0.04)
                              }
                            }}
                          >
                            Capture {label}
                          </Button>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
                
                <FormControlLabel
                  control={<StyledCheckbox size="small" />}
                  label={<Typography variant="body2" sx={{ color: '#555' }}>I consent to a customized skincare treatment plan</Typography>}
                />
                
                <FormControlLabel
                  control={<StyledCheckbox size="small" />}
                  label={<Typography variant="body2" sx={{ color: '#555' }}>I agree to the privacy policy and terms of service</Typography>}
                />
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 5 && (
            <StyledMainCard 
              title={
                <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                  What Happens Next?
                </Typography>
              }
              sx={{ background: 'linear-gradient(to right, #ffffff, #f3e5f5)' }}
            >
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                Once your form is submitted:
              </Typography>
              <Stack spacing={1}>
                {['Expert dermatology review', 'Tailored treatment plan creation', 
                  'Product compounding and delivery', 'Ongoing support available anytime'].map((item) => (
                  <Typography key={item} variant="body2" sx={{ color: '#555', display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#6a1b9a',
                      marginRight: 8 
                    }}></span>
                    {item}
                  </Typography>
                ))}
              </Stack>
              <Typography variant="body2" sx={{ mt: 2, color: '#6a1b9a', fontStyle: 'italic' }}>
                Let's begin your journey toward clearer, healthier skin — together.
              </Typography>
            </StyledMainCard>
          )}

          {/* Navigation buttons */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <NavigationButton
              variant="outlined"
              disabled={currentStep === 1}
              onClick={handlePrevious}
              sx={{
                color: '#6a1b9a',
                borderColor: '#6a1b9a',
                '&:hover': {
                  backgroundColor: alpha('#6a1b9a', 0.04),
                  borderColor: '#6a1b9a',
                }
              }}
            >
              Back to previous question
            </NavigationButton>
            
            {currentStep < totalSteps ? (
              <NavigationButton
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: '#6a1b9a',
                  '&:hover': {
                    backgroundColor: '#7b1fa2',
                  }
                }}
              >
                Next Step
              </NavigationButton>
            ) : (
              <ColorButton fullWidth size="medium">
                Submit Your Information
              </ColorButton>
            )}
          </Stack>

          <StyledMainCard 
            title={
              <Typography variant="h5" sx={{ color: '#6a1b9a', fontWeight: 600 }}>
                Medskls Apothecary Privacy Policy
              </Typography>
            }
          >
            <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
              Your trust means everything to us. At Medskls Apothecary, we're committed to protecting your personal information.
            </Typography>
            <Divider sx={{ my: 2, borderColor: alpha('#6a1b9a', 0.2) }} />
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#6a1b9a', fontWeight: 500 }}>
              How We Use Your Personal Information
            </Typography>
            <Stack spacing={1}>
              {[
                'Understand your skin concerns and health history',
                'Provide a safe, personalized skincare plan',
                'Deliver your products to the right place',
                'Keep you updated on orders and product reminders',
                'Respond to your queries and support needs'
              ].map((item, index) => (
                <Typography key={index} variant="body2" sx={{ color: '#555', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#6a1b9a',
                    marginRight: 8 
                  }}></span>
                  {item}
                </Typography>
              ))}
            </Stack>
            <Divider sx={{ my: 2, borderColor: alpha('#6a1b9a', 0.2) }} />
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#6a1b9a', fontWeight: 500 }}>
              What Information Do We Collect?
            </Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>
              When you sign up or place an order, we may collect your Name, Email, Phone Number, Address, Skin Details, and Photos.
            </Typography>
          </StyledMainCard>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PatientSurvey;