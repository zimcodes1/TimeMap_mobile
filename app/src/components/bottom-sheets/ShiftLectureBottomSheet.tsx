import React, { useState, useEffect } from "react";
import {
	View,
	StyleSheet,
	TextInput,
	ScrollView,
	Pressable,
	ActivityIndicator,
} from "react-native";
import {
	Calendar,
	Clock,
	MapPin,
	Check,
	AlertCircle,
	Repeat,
	CalendarClock,
	Wifi,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Text } from "@/components/common/Text";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Session } from "@/types";
import { useVenues, useVenueAvailability } from "@/hooks/useShiftLecture";
import { VenueSlot } from "@/api/venuesAPI";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ShiftLectureBottomSheetProps {
	visible: boolean;
	onClose: () => void;
	session: Session | null;
	onSubmitShift: (params: {
		isRecurring: boolean;
		venueId: string;
		venueName: string;
		date: string;
		startTime: string;
		endTime: string;
		reason: string;
	}) => void;
	isSubmitting?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ShiftLectureBottomSheet: React.FC<
	ShiftLectureBottomSheetProps
> = ({ visible, onClose, session, onSubmitShift, isSubmitting = false }) => {
	// Mode: single instance vs recurrent pattern
	const [isRecurring, setIsRecurring] = useState(false);

	// Selected date (defaults to session date)
	const [date, setDate] = useState("");

	// Selected venue
	const [selectedVenueId, setSelectedVenueId] = useState("");
	const [selectedVenueName, setSelectedVenueName] = useState("");

	// Selected slot
	const [selectedSlot, setSelectedSlot] = useState<VenueSlot | null>(null);

	// Reason
	const [reason, setReason] = useState("");

	// Course param for scoped venues (ID or code)
	const courseParam = session?.course?.id || session?.course?.code;

	// Real-time venues query
	const {
		data: venues = [],
		isLoading: isLoadingVenues,
		isError: isVenuesError,
		refetch: refetchVenues,
	} = useVenues(visible && courseParam ? courseParam : undefined);

	// Fallback: make sure the session's current venue is always present in the selection list
	const displayVenues = React.useMemo(() => {
		if (!session?.venue?.id) return venues;
		const exists = venues.some(
			(v) => String(v.id) === String(session.venue.id),
		);
		if (!exists && session.venue.id) {
			return [
				{
					id: String(session.venue.id),
					name: session.venue.name || "Current Venue",
					venueType: "lecture_hall",
					capacity: session.venue.capacity || 0,
					isActive: true,
				},
				...venues,
			];
		}
		return venues;
	}, [venues, session?.venue]);

	// Real-time venue availability query
	const {
		data: availability,
		isLoading: isLoadingAvailability,
		isError: isAvailabilityError,
		refetch: refetchAvailability,
	} = useVenueAvailability(
		visible && selectedVenueId ? selectedVenueId : undefined,
		visible && date ? date : undefined,
		session?.id,
	);

	// Initialize/reset form state on open
	useEffect(() => {
		if (visible && session) {
			setIsRecurring(false);
			setDate(session.date || new Date().toISOString().split("T")[0]);
			setSelectedVenueId(String(session.venue.id || ""));
			setSelectedVenueName(session.venue.name || "");
			setSelectedSlot(null);
			setReason("");
		}
	}, [visible, session]);

	// If initial venue is loaded, make sure venue name is in sync
	useEffect(() => {
		if (displayVenues.length > 0 && selectedVenueId) {
			const found = displayVenues.find(
				(v) => String(v.id) === String(selectedVenueId),
			);
			if (found) {
				setSelectedVenueName(found.name);
			}
		}
	}, [displayVenues, selectedVenueId]);

	const slots = availability?.slots ?? [];

	// Validation
	const hasTimeSelected = Boolean(selectedSlot?.start && selectedSlot?.end);
	const hasVenueSelected = Boolean(selectedVenueId);
	const hasReasonIfRequired = !isRecurring || reason.trim().length >= 5;
	const canSubmit =
		!isSubmitting && hasVenueSelected && hasTimeSelected && hasReasonIfRequired;

	const handleSubmit = () => {
		if (!canSubmit || !selectedSlot) return;
		onSubmitShift({
			isRecurring,
			venueId: selectedVenueId,
			venueName: selectedVenueName,
			date,
			startTime: selectedSlot.start.substring(0, 5),
			endTime: selectedSlot.end.substring(0, 5),
			reason: reason.trim(),
		});
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title="Shift Lecture"
			subtitle={
				session ? `${session.course.code} · ${session.course.title}` : undefined
			}
		>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.scrollContent}
			>
				{/* Recurrence Mode Selector */}
				<View style={styles.modeContainer}>
					<Pressable
						style={[styles.modeTab, !isRecurring && styles.modeTabActive]}
						onPress={() => setIsRecurring(false)}
					>
						<CalendarClock
							size={16}
							color={!isRecurring ? colors.primary : colors.textSubtle}
						/>
						<Text
							style={[
								styles.modeTabText,
								!isRecurring && styles.modeTabTextActive,
							]}
						>
							This Session Only
						</Text>
					</Pressable>

					<Pressable
						style={[styles.modeTab, isRecurring && styles.modeTabActive]}
						onPress={() => setIsRecurring(true)}
					>
						<Repeat
							size={16}
							color={isRecurring ? colors.primary : colors.textSubtle}
						/>
						<Text
							style={[
								styles.modeTabText,
								isRecurring && styles.modeTabTextActive,
							]}
						>
							Recurring Change
						</Text>
					</Pressable>
				</View>

				{isRecurring ? (
					<View style={styles.infoBanner}>
						<AlertCircle size={15} color={colors.warning} />
						<Text style={styles.infoBannerText}>
							A recurring change submits a discrepancy request for Admin
							approval before updating all future sessions.
						</Text>
					</View>
				) : null}

				{/* Live Network Notice */}
				<View style={styles.networkBadgeRow}>
					<Wifi size={13} color={colors.primary} />
					<Text style={styles.networkBadgeText}>
						Realtime verification active
					</Text>
				</View>

				{/* Date Section */}
				<View style={styles.section}>
					<Text style={styles.fieldLabel}>Lecture Date</Text>
					<View style={styles.dateDisplay}>
						<Calendar size={16} color={colors.textMuted} />
						<TextInput
							style={styles.dateInput}
							value={date}
							onChangeText={(text) => {
								setDate(text);
								setSelectedSlot(null);
							}}
							placeholder="YYYY-MM-DD"
							placeholderTextColor={colors.textSubtle}
						/>
					</View>
				</View>

				{/* Venue Selector */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>Select Venue (Course Scope)</Text>
						{isLoadingVenues ? (
							<ActivityIndicator size="small" color={colors.primary} />
						) : null}
					</View>

					{isVenuesError ? (
						<Pressable onPress={() => refetchVenues()} style={styles.retryBox}>
							<Text style={styles.retryText}>
								Could not load venues. Tap to retry.
							</Text>
						</Pressable>
					) : null}

					{isLoadingVenues && displayVenues.length === 0 ? (
						<View style={styles.loadingVenuesBox}>
							<Text style={styles.loadingVenuesText}>
								Loading allowed venues...
							</Text>
						</View>
					) : displayVenues.length === 0 ? (
						<View style={styles.emptyVenuesBox}>
							<Text style={styles.emptyVenuesText}>
								No venues found for this course scope.
							</Text>
						</View>
					) : (
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.venueRow}
						>
							{displayVenues.map((venue) => {
								const isSelected = String(venue.id) === String(selectedVenueId);
								return (
									<Pressable
										key={venue.id}
										style={[
											styles.venuePill,
											isSelected && styles.venuePillActive,
										]}
										onPress={() => {
											setSelectedVenueId(String(venue.id));
											setSelectedVenueName(venue.name);
											setSelectedSlot(null);
										}}
									>
										<MapPin
											size={14}
											color={isSelected ? colors.primary : colors.textSubtle}
										/>
										<Text
											style={[
												styles.venuePillText,
												isSelected && styles.venuePillTextActive,
											]}
										>
											{venue.name}
										</Text>
										{venue.capacity ? (
											<Text
												style={[
													styles.venueCapText,
													isSelected && styles.venueCapTextActive,
												]}
											>
												({venue.capacity})
											</Text>
										) : null}
									</Pressable>
								);
							})}
						</ScrollView>
					)}
				</View>

				{/* Available Time Slots */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>Available Time Slots</Text>
						{isLoadingAvailability ? (
							<ActivityIndicator size="small" color={colors.primary} />
						) : null}
					</View>

					{isAvailabilityError ? (
						<Pressable
							onPress={() => refetchAvailability()}
							style={styles.retryBox}
						>
							<Text style={styles.retryText}>
								Could not verify slots. Tap to retry.
							</Text>
						</Pressable>
					) : null}

					{isLoadingAvailability ? (
						<View style={styles.slotsLoading}>
							<ActivityIndicator size="small" color={colors.primary} />
							<Text style={styles.slotsLoadingText}>
								Checking live venue availability…
							</Text>
						</View>
					) : slots.length === 0 ? (
						<View style={styles.emptySlots}>
							<AlertCircle size={16} color={colors.textSubtle} />
							<Text style={styles.emptySlotsText}>
								No available free slots for this venue on {date}. Try another
								venue or date.
							</Text>
						</View>
					) : (
						<View style={styles.slotsGrid}>
							{slots.map((slot, index) => {
								const isSelected =
									selectedSlot?.start === slot.start &&
									selectedSlot?.end === slot.end;
								return (
									<Pressable
										key={`slot-${index}`}
										style={[
											styles.slotCard,
											isSelected && styles.slotCardActive,
										]}
										onPress={() => setSelectedSlot(slot)}
									>
										<View style={styles.slotHeader}>
											<Clock
												size={14}
												color={isSelected ? colors.primary : colors.textSubtle}
											/>
											<Text
												style={[
													styles.slotLabel,
													isSelected && styles.slotLabelActive,
												]}
											>
												{slot.label}
											</Text>
										</View>
										{isSelected ? (
											<Check size={16} color={colors.primary} />
										) : null}
									</Pressable>
								);
							})}
						</View>
					)}

					<Text style={styles.operatingHint}>
						Standard operating hours: 8:00 AM – 6:00 PM
					</Text>
				</View>

				{/* Reason / Notes */}
				<View style={styles.section}>
					<View style={styles.labelRow}>
						<Text style={styles.fieldLabel}>
							{isRecurring ? "Reason for Recurrent Shift" : "Reason / Notes"}
						</Text>
						{isRecurring ? (
							<Text style={styles.requiredBadge}>Required</Text>
						) : (
							<Text style={styles.optionalBadge}>Optional</Text>
						)}
					</View>

					<TextInput
						style={styles.textarea}
						value={reason}
						onChangeText={setReason}
						placeholder={
							isRecurring
								? "Explain why this recurring lecture schedule needs to change (required for admin approval)…"
								: "Optional notes regarding this shift…"
						}
						placeholderTextColor={colors.textSubtle}
						multiline
						numberOfLines={3}
						textAlignVertical="top"
						editable={!isSubmitting}
					/>
					{isRecurring &&
					reason.trim().length > 0 &&
					reason.trim().length < 5 ? (
						<Text style={styles.errorText}>
							Reason must be at least 5 characters.
						</Text>
					) : null}
				</View>

				{/* Actions */}
				<View style={styles.actions}>
					<Button
						variant="primary"
						size="lg"
						onPress={handleSubmit}
						disabled={!canSubmit}
						isLoading={isSubmitting}
					>
						{isRecurring ? "Submit for Admin Approval" : "Confirm Shift"}
					</Button>
					<Button
						variant="ghost"
						size="md"
						onPress={onClose}
						style={styles.cancelBtn}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</View>
			</ScrollView>
		</BottomSheet>
	);
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	scrollView: {
		flexShrink: 1,
	},
	scrollContent: {
		paddingBottom: 48,
	},
	modeContainer: {
		flexDirection: "row",
		backgroundColor: colors.surfaceRaised,
		borderRadius: 12,
		padding: 4,
		marginBottom: 12,
	},
	modeTab: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		paddingVertical: 10,
		borderRadius: 8,
	},
	modeTabActive: {
		backgroundColor: colors.surface,
	},
	modeTabText: {
		fontSize: 13,
		color: colors.textSubtle,
		fontWeight: "500",
	},
	modeTabTextActive: {
		color: colors.textMain,
		fontWeight: "600",
	},
	infoBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: `${colors.warning}15`,
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
	},
	infoBannerText: {
		flex: 1,
		fontSize: 12,
		color: colors.warning,
		lineHeight: 16,
	},
	networkBadgeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 14,
	},
	networkBadgeText: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: "500",
	},
	section: {
		marginBottom: 16,
	},
	labelRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	fieldLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.textMain,
		marginBottom: 6,
	},
	requiredBadge: {
		fontSize: 11,
		color: colors.danger,
		fontWeight: "500",
	},
	optionalBadge: {
		fontSize: 11,
		color: colors.textSubtle,
	},
	dateDisplay: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	dateInput: {
		flex: 1,
		color: colors.textMain,
		fontSize: 14,
		padding: 0,
	},
	venueRow: {
		gap: 8,
		paddingVertical: 4,
	},
	venuePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	venuePillActive: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}15`,
	},
	venuePillText: {
		fontSize: 13,
		color: colors.textMuted,
		fontWeight: "500",
	},
	venuePillTextActive: {
		color: colors.primary,
		fontWeight: "600",
	},
	venueCapText: {
		fontSize: 11,
		color: colors.textSubtle,
	},
	venueCapTextActive: {
		color: colors.primary,
	},
	loadingVenuesBox: {
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
		alignItems: "center",
		marginVertical: 4,
	},
	loadingVenuesText: {
		fontSize: 12,
		color: colors.textSubtle,
	},
	emptyVenuesBox: {
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
		marginVertical: 4,
	},
	emptyVenuesText: {
		fontSize: 12,
		color: colors.textSubtle,
	},
	slotsLoading: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
	},
	slotsLoadingText: {
		fontSize: 13,
		color: colors.textSubtle,
	},
	emptySlots: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 12,
		backgroundColor: colors.surfaceRaised,
		borderRadius: 10,
	},
	emptySlotsText: {
		flex: 1,
		fontSize: 12,
		color: colors.textSubtle,
	},
	slotsGrid: {
		gap: 8,
	},
	slotCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	slotCardActive: {
		borderColor: colors.primary,
		backgroundColor: `${colors.primary}15`,
	},
	slotHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	slotLabel: {
		fontSize: 13,
		color: colors.textMain,
		fontWeight: "500",
	},
	slotLabelActive: {
		color: colors.primary,
		fontWeight: "600",
	},
	operatingHint: {
		fontSize: 11,
		color: colors.textSubtle,
		marginTop: 6,
	},
	retryBox: {
		padding: 8,
		marginBottom: 8,
	},
	retryText: {
		fontSize: 12,
		color: colors.primary,
	},
	textarea: {
		backgroundColor: colors.surfaceRaised,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 10,
		padding: 12,
		color: colors.textMain,
		fontSize: 13,
		minHeight: 70,
	},
	errorText: {
		fontSize: 11,
		color: colors.danger,
		marginTop: 4,
	},
	actions: {
		gap: 8,
		marginTop: 8,
	},
	cancelBtn: {
		marginTop: 2,
	},
});
