"""Seed script for doctors and time slots."""
import os, sys, django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from appointments.models import Doctor, TimeSlot

# Only seed if empty
if Doctor.objects.count() == 0:
    doctors_data = [
        {
            'first_name': 'Sarah', 'last_name': 'Patel',
            'specialization': 'cardiology',
            'qualification': 'MBBS, MD Cardiology',
            'experience_years': 12, 'hospital': 'Apollo Heart Center',
            'bio': 'Board-certified cardiologist specializing in preventive heart care and cardiac imaging.',
            'consultation_fee': 500, 'rating': 4.8, 'total_reviews': 124,
        },
        {
            'first_name': 'James', 'last_name': 'Wilson',
            'specialization': 'general',
            'qualification': 'MBBS, MRCGP',
            'experience_years': 8, 'hospital': 'City Medical Clinic',
            'bio': 'Experienced GP focused on holistic health and preventive medicine.',
            'consultation_fee': 300, 'rating': 4.6, 'total_reviews': 89,
        },
        {
            'first_name': 'Anita', 'last_name': 'Sharma',
            'specialization': 'pulmonology',
            'qualification': 'MBBS, DM Pulmonology',
            'experience_years': 15, 'hospital': 'LifeCare Lung Institute',
            'bio': 'Pulmonologist with expertise in sleep disorders and respiratory conditions.',
            'consultation_fee': 600, 'rating': 4.9, 'total_reviews': 203,
        },
        {
            'first_name': 'Michael', 'last_name': 'Chen',
            'specialization': 'endocrinology',
            'qualification': 'MBBS, MD Endocrinology',
            'experience_years': 10, 'hospital': 'Metro Health Center',
            'bio': 'Endocrinologist specializing in diabetes management and thyroid disorders.',
            'consultation_fee': 450, 'rating': 4.7, 'total_reviews': 156,
        },
    ]

    for d in doctors_data:
        doc = Doctor.objects.create(**d)
        # Add time slots: Mon-Fri, 9am-12pm and 2pm-5pm
        for weekday in range(5):
            TimeSlot.objects.create(doctor=doc, weekday=weekday, start_time='09:00', end_time='12:00')
            TimeSlot.objects.create(doctor=doc, weekday=weekday, start_time='14:00', end_time='17:00')
        print(f"Created: {doc.full_name}")

    print(f"\nSeeded {Doctor.objects.count()} doctors with time slots.")
else:
    print(f"Skipped — {Doctor.objects.count()} doctors already exist.")
