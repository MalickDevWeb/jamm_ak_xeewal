import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuditAdminService, AuditLogItem } from './audit-admin.service';
import { environment } from '../../../environments/environment';

describe('AuditAdminService', () => {
  let service: AuditAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditAdminService],
    });
    service = TestBed.inject(AuditAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être instancié avec succès', () => {
    expect(service).toBeTruthy();
  });

  it('devrait appeler l\'API avec les bons paramètres de filtrage', () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 'log-1',
          organizationId: 'org-1',
          actorId: 'admin-1',
          actorName: 'Amadou Fall',
          actorPrenom: 'Amadou',
          actorNom: 'Fall',
          actorEmail: 'amadou@jammakxeewal.sn',
          actorPhone: '+221 77 123 45 67',
          actorProfile: 'Trésorier',
          actorRole: 'ADMIN',
          action: 'EXPENSE_APPROVED',
          category: 'FINANCE' as const,
          severity: 'CRITICAL' as const,
          entityType: 'Expense',
          entityId: 'exp-123',
          metadata: { amount: 50000 },
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 25,
      totalPages: 1,
      stats: {
        total: 1,
        criticalCount: 1,
        highCount: 0,
        financeCount: 1,
      },
    };

    service
      .getAuditLogs({
        page: 1,
        limit: 25,
        category: 'FINANCE',
        severity: 'CRITICAL',
        search: 'Amadou',
      })
      .subscribe((res) => {
        expect(res.success).toBe(true);
        expect(res.data.length).toBe(1);
        expect(res.data[0].actorPrenom).toBe('Amadou');
        expect(res.data[0].actorNom).toBe('Fall');
        expect(res.data[0].actorProfile).toBe('Trésorier');
      });

    const req = httpMock.expectOne((r) =>
      r.url === `${environment.apiUrl}/audit` &&
      r.params.get('page') === '1' &&
      r.params.get('limit') === '25' &&
      r.params.get('category') === 'FINANCE' &&
      r.params.get('severity') === 'CRITICAL' &&
      r.params.get('search') === 'Amadou'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('devrait générer un export CSV sans erreur', () => {
    const mockLogs: AuditLogItem[] = [
      {
        id: 'log-1',
        organizationId: 'org-1',
        actorId: 'admin-1',
        actorName: 'Papa Malick Teuw',
        actorPrenom: 'Papa Malick',
        actorNom: 'Teuw',
        actorEmail: 'malick@jammakxeewal.sn',
        actorPhone: '+221 77 900 00 00',
        actorProfile: 'Responsable Communication',
        actorRole: 'ADMIN',
        action: 'NOTIFICATION_SENT',
        category: 'SECURITY',
        severity: 'HIGH',
        entityType: 'Notification',
        entityId: 'notif-1',
        metadata: { recipients: 150 },
        ipAddress: '192.168.1.1',
        createdAt: '2026-09-05T12:00:00Z',
      },
    ];

    expect(() => service.exportToCsv(mockLogs, 'test-audit.csv')).not.toThrow();
  });
});
