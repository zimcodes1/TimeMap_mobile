import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { StudentRegisterScreen } from '@/screens/auth/StudentRegisterScreen';
import {
  studentRegisterSchema,
  StudentRegisterSchema,
} from '@/lib/validation/auth';
import { authAPI } from '@/api/authAPI';
import { useAuth } from '@/context/AuthContext';

export default function RegisterRoute() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  // Fetch registration options (faculties, departments, programs)
  const {
    data: optionsData,
    isLoading: isFetchingOptions,
    isError,
    error: optionsError,
    refetch,
  } = useQuery({
    queryKey: ['registration-options'],
    queryFn: async () => {
      console.log('[RegisterRoute] Fetching registration options...');
      const res = await authAPI.getRegistrationOptions();
      console.log('[RegisterRoute] Registration options loaded:', {
        facultiesCount: res.faculties?.length,
        departmentsCount: res.departments?.length,
        programsCount: res.programs?.length,
      });
      return res;
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentRegisterSchema>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      fullName: '',
      matricNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedFacultyId = watch('facultyId');
  const selectedDepartmentId = watch('departmentId');
  const selectedProgramId = watch('programId');
  const selectedLevel = watch('level');

  const handleSelectFaculty = (facultyId: number) => {
    setValue('facultyId', facultyId, { shouldValidate: true });
    // Reset dependent fields
    setValue('departmentId', undefined as any, { shouldValidate: false });
    setValue('programId', undefined as any, { shouldValidate: false });
    setValue('level', undefined as any, { shouldValidate: false });
  };

  const handleSelectDepartment = (departmentId: number) => {
    setValue('departmentId', departmentId, { shouldValidate: true });
    // Reset dependent fields
    setValue('programId', undefined as any, { shouldValidate: false });
    setValue('level', undefined as any, { shouldValidate: false });
  };

  const handleSelectProgram = (programId: number) => {
    setValue('programId', programId, { shouldValidate: true });
    // Reset level when program changes
    setValue('level', undefined as any, { shouldValidate: false });
  };

  const handleSelectLevel = (level: number) => {
    setValue('level', level, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await signup({
        matric_number: data.matricNumber,
        full_name: data.fullName,
        email: data.email,
        faculty: data.facultyId,
        department: data.departmentId,
        program: data.programId,
        level: data.level,
        password: data.password,
      });
      // Navigation is automatically handled by NavigationGate in _layout.tsx
    } catch (error: any) {
      let errorMsg = 'Failed to create student account. Please try again.';
      if (error?.data) {
        if (typeof error.data === 'string') {
          errorMsg = error.data;
        } else if (typeof error.data === 'object') {
          const firstKey = Object.keys(error.data)[0];
          const val = error.data[firstKey];
          errorMsg = Array.isArray(val) ? val[0] : String(val);
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <StudentRegisterScreen
      control={control}
      errors={errors}
      isLoading={isSubmitting}
      isFetchingOptions={isFetchingOptions}
      isOptionsError={isError}
      optionsErrorMessage={optionsError?.message}
      onRetryFetchOptions={() => refetch()}
      faculties={optionsData?.faculties || []}
      departments={optionsData?.departments || []}
      programs={optionsData?.programs || []}
      selectedFacultyId={selectedFacultyId}
      selectedDepartmentId={selectedDepartmentId}
      selectedProgramId={selectedProgramId}
      selectedLevel={selectedLevel}
      onSelectFaculty={handleSelectFaculty}
      onSelectDepartment={handleSelectDepartment}
      onSelectProgram={handleSelectProgram}
      onSelectLevel={handleSelectLevel}
      onSubmit={onSubmit}
      onNavigateBack={() => router.back()}
    />
  );
}
