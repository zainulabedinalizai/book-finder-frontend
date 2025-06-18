import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useAuth } from "../Context/AuthContext";
import { patientAPI, questionAPI, UploadEmployeeFiles } from "../Api/api";
import MainCard from "../Components/MainCard";

// ==============================|| STYLED COMPONENTS ||============================== //

const ColorButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
  border: 0,
  borderRadius: 25,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .2)",
  color: "white",
  height: 48,
  padding: "0 30px",
  "&:hover": {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  },
}));

const StyledMainCard = styled(MainCard)(({ theme }) => ({
  borderRadius: 16,
  borderLeft: `6px solid ${alpha(theme.palette.primary.main, 0.7)}`,
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const MultilineSpecifyField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 10,
    fontSize: "0.875rem",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease-in-out",
    "& textarea": {
      padding: "10px 12px",
      minHeight: "48px",
      resize: "vertical",
      fontFamily: "'Roboto','Helvetica','Arial',sans-serif",
      fontSize: "0.875rem",
      transition: "all 0.2s ease-in-out",
    },
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  marginTop: 6,
  marginLeft: 32,
  width: "calc(100% - 64px)", // Less wide, clean indent
}));

const SpecifyTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    height: 36,
    fontSize: "0.8125rem",
    "& input": {
      padding: "8px 12px",
    },
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
  "& .MuiInputLabel-root": {
    transform: "translate(14px, 10px) scale(1)",
    fontSize: "0.8125rem",
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    "& fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.6),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: theme.palette.primary.main,
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
}));

const NavigationButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: "8px 24px",
  fontWeight: 600,
  textTransform: "none",
}));

// ==============================|| PATIENT ONBOARDING JOURNEY ||============================== //

const PatientSurvey = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [capturedImages, setCapturedImages] = useState({
    "Front View": null,
    "Side View (Left)": null,
    "Side View (Right)": null,
  });
  const [imagePaths, setImagePaths] = useState({
    "Front View": null,
    "Side View (Left)": null,
    "Side View (Right)": null,
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentCaptureLabel, setCurrentCaptureLabel] = useState("");
  const [specifyTexts, setSpecifyTexts] = useState({});
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
    },
    answers: {},
    consents: {},
  });

  // Group questions by QuestionId
  const groupedQuestions = questions.reduce((acc, question) => {
    // Skip if we've already processed this QuestionId
    if (acc[question.QuestionId]) {
      // Only add the option if it doesn't exist
      const optionExists = acc[question.QuestionId].Options.some(
        (opt) => opt.OptionId === question.OptionId
      );
      if (!optionExists) {
        acc[question.QuestionId].Options.push({
          OptionId: question.OptionId,
          OptionText: question.OptionText,
          DisplayOrder: question.DisplayOrder1,
        });
      }
      return acc;
    }

    // New question entry
    acc[question.QuestionId] = {
      QuestionId: question.QuestionId,
      QuestionText: question.QuestionText,
      QuestionType: question.QuestionType,
      DisplayOrder: question.DisplayOrder,
      Options: [
        {
          OptionId: question.OptionId,
          OptionText: question.OptionText,
          DisplayOrder: question.DisplayOrder1,
        },
      ],
    };
    return acc;
  }, {});

  const sortedQuestions = Object.values(groupedQuestions).sort(
    (a, b) => a.DisplayOrder - b.DisplayOrder
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await questionAPI.getQuestionAndOptionList();
        if (response.data.success) {
          setQuestions(response.data.data);

          const initialAnswers = {};
          const initialConsents = {};
          const initialSpecifyTexts = {};

          response.data.data.forEach((q) => {
            if (q.QuestionType === "multiple_choice") {
              initialAnswers[q.QuestionId] = [];
            } else if (q.QuestionType === "single_choice") {
              initialAnswers[q.QuestionId] = "";
            }

            // Initialize specify texts for options that need it
            if (
              q.OptionText.includes("(please specify)") ||
              q.OptionText.includes("(please list)")
            ) {
              initialSpecifyTexts[`${q.QuestionId}_${q.OptionId}`] = "";
            }

            if (
              q.QuestionText.includes("consent") ||
              q.QuestionText.includes("agree")
            ) {
              initialConsents[q.QuestionId] = false;
            }
          });

          setFormData((prev) => ({
            ...prev,
            answers: initialAnswers,
            consents: initialConsents,
          }));
          setSpecifyTexts(initialSpecifyTexts);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load survey questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

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

  const handleFileUpload = async (event, label) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result.split(",")[1];
        const imageData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "PatientImages",
          AssignmentTitle: label.replace(/\s+/g, ""),
          Path: "Assets/PatientImages/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setCapturedImages((prev) => ({
            ...prev,
            [label]: e.target.result,
          }));
          setImagePaths((prev) => ({
            ...prev,
            [label]: response.data[0],
          }));
        } else {
          throw new Error(response.message || "Failed to upload image");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload image. Please try again.");
    }
  };

  const handleStartCamera = (label) => {
    setCurrentCaptureLabel(label);
    setShowCamera(true);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }
  };

  const handleCapturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL("image/png");
      const base64String = imageDataUrl.split(",")[1];
      const fileName = `patient_${currentCaptureLabel.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}.png`;

      try {
        const imageData = {
          Image: `${fileName}|${base64String}`,
          fileName: fileName,
          fileType: "image/png",
        };

        const params = {
          SubjectName: "PatientImages",
          AssignmentTitle: currentCaptureLabel.replace(/\s+/g, ""),
          Path: "Assets/PatientImages/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setCapturedImages((prev) => ({
            ...prev,
            [currentCaptureLabel]: imageDataUrl,
          }));
          setImagePaths((prev) => ({
            ...prev,
            [currentCaptureLabel]: response.data[0],
          }));
        } else {
          throw new Error(
            response.message || "Failed to upload captured image"
          );
        }
      } catch (err) {
        console.error("Error uploading captured image:", err);
        setError("Failed to save captured image. Please try again.");
      }

      // Stop camera
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      setShowCamera(false);
    }
  };

  const handleCancelCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const handlePersonalInfoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handleAnswerChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: Number(value), // Convert to number
      },
    }));
  };

  const handleCheckboxChange = (questionId, optionId, isChecked) => {
    setFormData((prev) => {
      const currentAnswers = prev.answers[questionId] || [];
      let updatedAnswers;

      if (isChecked) {
        updatedAnswers = [...currentAnswers, optionId];
      } else {
        updatedAnswers = currentAnswers.filter((id) => id !== optionId);
      }

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: updatedAnswers,
        },
      };
    });
  };

  const handleConsentChange = (questionId, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      consents: {
        ...prev.consents,
        [questionId]: isChecked,
      },
    }));
  };

  const handleSpecifyTextChange = useCallback((key, value) => {
    setSpecifyTexts((prev) => {
      // Check if this is a single choice question (key is just questionId)
      if (/^\d+$/.test(key)) {
        return { ...prev, [key]: value };
      }
      // For multiple choice (key is questionId_optionId)
      return { ...prev, [key]: value };
    });
  }, []);

  const handleSubmitConfirmation = () => {
    setOpenConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleSubmit = async () => {
    setOpenConfirmation(false);
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const userId = user?.UserId || parseInt(localStorage.getItem("userId"));
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Safety check - ensure questions are loaded
      if (!questions || questions.length === 0) {
        throw new Error("Questions not loaded yet");
      }

      // Prepare responses array
      const responses = [];

      console.group("Form Submission Data");
      console.log("Questions:", questions); // Log questions to verify they're loaded
      console.log("Form Answers:", formData.answers);
      console.log("Specify Texts:", specifyTexts);
      console.log("Image Paths:", imagePaths);

      // Process all answered questions
      Object.entries(formData.answers).forEach(([questionId, answer]) => {
        const question = groupedQuestions[questionId];

        if (!question) {
          console.warn(`Question with ID ${questionId} not found`);
          return; // Skip if question not found
        }

        console.group(`Processing Question ID: ${questionId}`);
        console.log("Question Text:", question.QuestionText);
        console.log("Answer:", answer);

        // For image question (ID 13)
        if (parseInt(questionId) === 13) {
          const imageResponse = {
            QuestionId: 13,
            OptionId: [39, 40, 41]
              .filter((id) => {
                if (id === 39 && imagePaths["Front View"]) return true;
                if (id === 40 && imagePaths["Side View (Left)"]) return true;
                if (id === 41 && imagePaths["Side View (Right)"]) return true;
                return false;
              })
              .join(","),
            TextResponse: null,
            FrontSide: imagePaths["Front View"] || null,
            LeftSide: imagePaths["Side View (Left)"] || null,
            RightSide: imagePaths["Side View (Right)"] || null,
          };
          responses.push(imageResponse);
          console.log("Image Response:", imageResponse);
        }
        // For multiple choice questions
        else if (Array.isArray(answer) && answer.length > 0) {
          console.log("Processing as Multiple Choice");

          const textResponses = answer.map((optionId) => {
            const key = `${questionId}_${optionId}`;
            const option =
              question.Options?.find((opt) => opt.OptionId === optionId) || {};
            const needsSpecify =
              option.OptionText?.includes("(please specify)") ||
              option.OptionText?.includes("(please list)");

            console.log(`Option ${optionId}:`, {
              text: option.OptionText,
              needsSpecify,
              specifyText: needsSpecify ? specifyTexts[key] || null : null,
            });

            return {
              optionId,
              text: needsSpecify ? specifyTexts[key] || null : null,
            };
          });

          const response = {
            QuestionId: parseInt(questionId),
            OptionId: answer.join(","),
            TextResponse: textResponses
              .filter((res) => res.text !== null)
              .map((res) => res.text)
              .join("; "),
            FrontSide: null,
            LeftSide: null,
            RightSide: null,
          };
          responses.push(response);
          console.log("Multiple Choice Response:", response);
        }
        // For single choice questions
        else if (answer) {
          console.log("Processing as Single Choice");
          const option =
            question.Options?.find((opt) => opt.OptionId === answer) || {};
          const needsSpecify =
            option.OptionText?.includes("(please specify)") ||
            option.OptionText?.includes("(please list)");

          console.log(`Selected Option ${answer}:`, {
            text: option.OptionText,
            needsSpecify,
            specifyText: needsSpecify ? specifyTexts[questionId] || null : null,
          });

          const response = {
            QuestionId: parseInt(questionId),
            OptionId: answer.toString(),
            TextResponse: needsSpecify
              ? specifyTexts[questionId] || null
              : null,
            FrontSide: null,
            LeftSide: null,
            RightSide: null,
          };
          responses.push(response);
          console.log("Single Choice Response:", response);
        }
        console.groupEnd();
      });

      // Filter out any undefined responses
      const validResponses = responses.filter((res) => res !== undefined);

      // Prepare the final submission payload
      const submissionData = {
        UserId: userId,
        Responses: validResponses.filter(
          (res) => res.OptionId && res.OptionId.length > 0
        ),
      };

      console.log("Final Submission Payload:", submissionData);
      console.groupEnd();

      console.log(
        "%cFinal API Payload Structure",
        "color: #4CAF50; font-weight: bold"
      );
      console.log(JSON.stringify(submissionData, null, 2));

      const response = await patientAPI.savePatientApplication(submissionData);

      if (response.success && response.count > 0) {
        setSubmitSuccess(true);
      } else if (response.success && response.count === 0) {
        // API says it saved, but nothing inserted (e.g. missing answers)
        throw new Error("No responses were saved. Please check the form.");
      } else {
        // Proper error from API
        throw new Error(response.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (keep all your render functions the same until renderQuestionInput) ...

  const renderQuestionInput = useCallback(
    (question) => {
      if (question.QuestionId === 13) {
        // Special handling for the image upload question
        return (
          <Stack spacing={2}>
            {showCamera ? (
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: "#6a1b9a" }}>
                  Capturing: {currentCaptureLabel}
                </Typography>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", borderRadius: "12px" }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleCapturePhoto}
                    sx={{
                      backgroundColor: "#6a1b9a",
                      "&:hover": { backgroundColor: "#7b1fa2" },
                    }}
                  >
                    Capture Photo
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelCamera}
                    sx={{
                      color: "#6a1b9a",
                      borderColor: "#6a1b9a",
                      "&:hover": { borderColor: "#6a1b9a" },
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {question.Options.map((option) => (
                  <Stack key={option.OptionId} spacing={1}>
                    {capturedImages[option.OptionText] && (
                      <img
                        src={capturedImages[option.OptionText]}
                        alt={`Captured ${option.OptionText}`}
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "contain",
                          borderRadius: "12px",
                          border: `1px solid ${alpha("#6a1b9a", 0.3)}`,
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
                          borderColor: alpha("#6a1b9a", 0.3),
                          color: "#6a1b9a",
                          "&:hover": {
                            borderColor: "#6a1b9a",
                            backgroundColor: alpha("#6a1b9a", 0.04),
                          },
                        }}
                      >
                        Upload {option.OptionText}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            handleFileUpload(e, option.OptionText)
                          }
                        />
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        onClick={() => handleStartCamera(option.OptionText)}
                        sx={{
                          borderColor: alpha("#6a1b9a", 0.3),
                          color: "#6a1b9a",
                          "&:hover": {
                            borderColor: "#6a1b9a",
                            backgroundColor: alpha("#6a1b9a", 0.04),
                          },
                        }}
                      >
                        Capture {option.OptionText}
                      </Button>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        );
      }

      const needsSpecifyField = (optionText) => {
        return /\(please (specify|list)\)/i.test(optionText);
      };

      switch (question.QuestionType) {
        case "multiple_choice":
          return (
            <Grid container spacing={1}>
              {question.Options.map((option) => {
                const isSelected = formData.answers[
                  question.QuestionId
                ]?.includes(option.OptionId);
                const shouldShowSpecify =
                  isSelected && needsSpecifyField(option.OptionText);

                return (
                  <Grid item xs={12} key={option.OptionId}>
                    <Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              handleCheckboxChange(
                                question.QuestionId,
                                option.OptionId,
                                e.target.checked
                              );
                              if (!e.target.checked) {
                                handleSpecifyTextChange(
                                  `${question.QuestionId}_${option.OptionId}`,
                                  ""
                                );
                              }
                            }}
                          />
                        }
                        label={option.OptionText}
                      />
                      {shouldShowSpecify && (
                        <MultilineSpecifyField
                          multiline
                          minRows={2}
                          placeholder="Please specify..."
                          variant="outlined"
                          value={
                            specifyTexts[
                              `${question.QuestionId}_${option.OptionId}`
                            ] || ""
                          }
                          onChange={(e) =>
                            handleSpecifyTextChange(
                              `${question.QuestionId}_${option.OptionId}`,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          );

        case "single_choice":
          return (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={formData.answers[question.QuestionId] || ""}
                onChange={(e) => {
                  handleAnswerChange(question.QuestionId, e.target.value);
                  const selectedOption = question.Options.find(
                    (opt) => opt.OptionId === Number(e.target.value)
                  );
                  if (
                    !selectedOption ||
                    !needsSpecifyField(selectedOption.OptionText)
                  ) {
                    handleSpecifyTextChange(question.QuestionId, "");
                  }
                }}
              >
                {question.Options.map((option) => {
                  const isSelected =
                    Number(formData.answers[question.QuestionId]) ===
                    option.OptionId;
                  const shouldShowSpecify =
                    isSelected && needsSpecifyField(option.OptionText);

                  return (
                    <Box key={option.OptionId} sx={{ mb: 0.5 }}>
                      <FormControlLabel
                        value={option.OptionId}
                        control={<Radio size="small" />}
                        label={option.OptionText}
                      />
                      {shouldShowSpecify && (
                        <MultilineSpecifyField
                          fullWidth
                          size="small"
                          placeholder="Please specify..."
                          variant="outlined"
                          value={specifyTexts[question.QuestionId] || ""}
                          onChange={(e) =>
                            handleSpecifyTextChange(
                              question.QuestionId,
                              e.target.value
                            )
                          }
                        />
                      )}
                    </Box>
                  );
                })}
              </RadioGroup>
            </FormControl>
          );
        default:
          return null;
      }
    },
    [formData.answers, specifyTexts, showCamera, capturedImages]
  );

  return (
    <Grid container spacing={3} sx={{ background: "#fafafa" }}>
      <Grid xs={12}>
        <Stack sx={{ gap: 3 }}>
          <StyledMainCard
            title="Patient Onboarding Journey"
            sx={{ background: "linear-gradient(to right, #ffffff, #f8f5ff)" }}
          >
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                From Skin Concerns to Personalized Care
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                At Medskls Apothecary, our mission is to give you skincare that
                actually works—customized for your unique skin and your
                real-life routine. This journey begins with understanding you.
                Here's how we guide you through a smooth, thoughtful
                registration process that leads to the right treatment, the
                right product, and results you can trust.
              </Typography>
            </Stack>
          </StyledMainCard>

          {currentStep === 1 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 1: Tell Us About Your Skin
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                What you're experiencing matters deeply to us. The more we
                understand your skin's journey, the better we can support it.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {sortedQuestions
                  .filter((q) => q.DisplayOrder <= 7 && q.QuestionId !== 13) // Exclude QuestionId 13
                  .map((question) => (
                    <React.Fragment key={question.QuestionText}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 2 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 2: Your Lifestyle + Habits
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Your daily life plays a major role in your skin's health. This
                part helps us understand what your skin goes through every day.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {sortedQuestions
                  .filter(
                    (q) =>
                      q.DisplayOrder > 7 &&
                      q.DisplayOrder <= 12 &&
                      q.QuestionId !== 13 // Exclude QuestionId 13
                  )
                  .map((question) => (
                    <React.Fragment key={question.QuestionText}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 3 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  Step 3: Ready for Your Treatment Plan
                </Typography>
              }
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Once we understand your skin, health, and lifestyle, it's time
                to begin your personalized plan.
              </Typography>

              <Stack spacing={2} sx={{ mt: 2 }}>
                {/* Only include QuestionId 13 in Step 4 */}
                {sortedQuestions
                  .filter((q) => q.QuestionId === 13) // Include QuestionId 13
                  .map((question) => (
                    <React.Fragment key={`image-${question.QuestionId}`}>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "#6a1b9a", fontWeight: 500 }}
                      >
                        {question.QuestionText}
                      </Typography>
                      {renderQuestionInput(question)}
                    </React.Fragment>
                  ))}

                {/* Consent checkboxes */}
                {sortedQuestions
                  .filter(
                    (q) =>
                      q.QuestionText.toLowerCase().includes("consent") ||
                      q.QuestionText.toLowerCase().includes("agree")
                  )
                  .map((question) => (
                    <FormControlLabel
                      key={`consent-${question.QuestionId}`}
                      control={
                        <StyledCheckbox
                          checked={
                            formData.consents[question.QuestionId] || false
                          }
                          onChange={(e) =>
                            handleConsentChange(
                              question.QuestionId,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={question.QuestionText}
                    />
                  ))}
              </Stack>
            </StyledMainCard>
          )}

          {currentStep === 4 && (
            <StyledMainCard
              title={
                <Typography
                  variant="h5"
                  sx={{ color: "#6a1b9a", fontWeight: 600 }}
                >
                  What Happens Next?
                </Typography>
              }
              sx={{ background: "linear-gradient(to right, #ffffff, #f3e5f5)" }}
            >
              <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
                Once your form is submitted:
              </Typography>
              <Stack spacing={1}>
                {[
                  "Expert dermatology review",
                  "Tailored treatment plan creation",
                  "Product compounding and delivery",
                  "Ongoing support available anytime",
                ].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#6a1b9a",
                        marginRight: 8,
                      }}
                    ></span>
                    {item}
                  </Typography>
                ))}
              </Stack>
              <Typography
                variant="body2"
                sx={{ mt: 2, color: "#6a1b9a", fontStyle: "italic" }}
              >
                Let's begin your journey toward clearer, healthier skin —
                together.
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
                color: "#6a1b9a",
                borderColor: "#6a1b9a",
                "&:hover": {
                  backgroundColor: alpha("#6a1b9a", 0.04),
                  borderColor: "#6a1b9a",
                },
              }}
            >
              Back to previous question
            </NavigationButton>

            {currentStep < totalSteps ? (
              <NavigationButton
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: "#6a1b9a",
                  "&:hover": {
                    backgroundColor: "#7b1fa2",
                  },
                }}
              >
                Next Step
              </NavigationButton>
            ) : (
              <ColorButton
                fullWidth
                size="medium"
                onClick={handleSubmitConfirmation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{ color: "white", mr: 1 }}
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit Your Information"
                )}
              </ColorButton>
            )}
          </Stack>

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}

          <StyledMainCard>
            <Typography variant="body1" gutterBottom sx={{ color: "#555" }}>
              Your trust means everything to us. At Medskls Apothecary, we're
              committed to protecting your personal information.
            </Typography>
            <Divider sx={{ my: 2, borderColor: alpha("#6a1b9a", 0.2) }} />
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#6a1b9a", fontWeight: 500 }}
            >
              How We Use Your Personal Information
            </Typography>
            <Stack spacing={1}>
              {[
                "Understand your skin concerns and health history",
                "Provide a safe, personalized skincare plan",
                "Deliver your products to the right place",
                "Keep you updated on orders and product reminders",
                "Respond to your queries and support needs",
              ].map((item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: "#555", display: "flex", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#6a1b9a",
                      marginRight: 8,
                    }}
                  ></span>
                  {item}
                </Typography>
              ))}
            </Stack>
            <Divider sx={{ my: 2, borderColor: alpha("#6a1b9a", 0.2) }} />
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#6a1b9a", fontWeight: 500 }}
            >
              What Information Do We Collect?
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              When you sign up or place an order, we may collect your Name,
              Email, Phone Number, Address, Skin Details, and Photos.
            </Typography>
          </StyledMainCard>
        </Stack>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmation}
        onClose={handleCloseConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "#6a1b9a" }}>
          Confirm Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to submit your application? Please review all
            information before submitting as you won't be able to make changes
            after submission.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation} sx={{ color: "#6a1b9a" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            autoFocus
            sx={{
              backgroundColor: "#6a1b9a",
              color: "white",
              "&:hover": {
                backgroundColor: "#7b1fa2",
              },
            }}
          >
            Confirm Submission
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PatientSurvey;
